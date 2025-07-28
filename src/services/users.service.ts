import { Claims, Course, Prisma, PrismaClient, User } from '@prisma/client';
import Container, { Service } from 'typedi';
import { CreateUserDto, UpdateUserDto } from '../dtos/users.dto';
import { IUser } from '../interfaces/user.interface';
import { HttpException } from '../exceptions/HttpException';
import { PrismaService } from './prisma.service';
import { SUPER_ADMIN_PASS } from '../config';

@Service()
export class UserService {
  private prismaService = Container.get(PrismaService);
  private prismaUser = this.prismaService.user;
  private prisma = this.prismaService.prisma;
  public isValidUUID(uuid: string): boolean {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  }

  public async claimNgcs(user: User, ngc: number): Promise<Claims> {
    if (user.ngc - ngc < 0) {
      throw new HttpException(400, 'not enough points');
    }
    let claim: Claims;
    await this.prisma.$transaction(async prisma => {
      await prisma.user.update({
        where: { id: user.id },
        data: { ngc: user.ngc - ngc },
      });
      claim = await prisma.claims.create({
        data: {
          user_id: user.id,
          ngc_claimed: ngc,
          updated_at: new Date(),
        },
      });
    });
    return claim;
  }

  public async getNgcs(id: string): Promise<number> {
    const user = await this.prismaUser.findFirst({ where: { id, blocked: false }, select: { ngc: true } });
    return user.ngc;
  }

  public async getTopPoints(id: string): Promise<number> {
    const user = await this.prismaUser.findFirst({ where: { id, blocked: false }, select: { top_points: true } });
    return user.top_points;
  }

  public async findAllUser(page: number): Promise<any> {
    const [users, meta] = await this.prismaUser
      .paginate({
        where: { blocked: false },
        omit: { message: true, signature: true },
        orderBy: { top_points: 'desc' },
      })
      .withPages({
        limit: 20,
        page,
        includePageCount: true,
      });

    return { users, meta };
  }
  public async findAllAdminUser(page: number): Promise<any> {
    const allUsers = await this.prismaUser.findMany({
      omit: { message: true, signature: true },
      skip: (page - 1) * 20,
      take: 20,
      where: { isAdmin: true },
    });
    return allUsers;
  }

  public async editFlags(id: string, key: string, value: Prisma.JsonValue) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { flags: true },
    });

    if (!user?.flags) {
      throw new Error('User not found or flags not set');
    }

    const updatedFlags: Prisma.JsonObject = {
      ...(user.flags as Prisma.JsonObject), // Type assertion for JsonObject
      [key]: value, // Dynamically set the key and value
    };
    return this.prisma.user.update({
      where: { id },
      data: { flags: updatedFlags },
    });
  }

  public async findOneById(uid: string): Promise<any> {
    if (!this.isValidUUID(uid)) throw new HttpException(400, 'Invalid UUID');

    const user = await this.prismaUser.findUnique({ where: { id: uid, blocked: false }, include: { userCourses: true } });
    if (!user) throw new HttpException(404, "User doesn't exist");
    const claimsSum = await this.prisma.claims.aggregate({
      _sum: { ngc_claimed: true },
      where: { user_id: user.id, executed: false },
    });

    return { ...user, ngc_claimed: claimsSum._sum.ngc_claimed || 0 };
  }

  public async getUserGame(username: string): Promise<any> {
    const game = this.prismaUser.findFirst({ where: { username, blocked: false }, select: { id: true, ngc: true, game: true } });
    if (!game) throw new HttpException(404, "User doesn't exist");
    return game;
  }

  public async saveGameScreenshot(id: string, screenshot: string): Promise<any> {
    const user = await this.prismaUser.findUnique({ where: { id, blocked: false }, omit: { message: true, signature: true } });
    if (!user) throw new HttpException(404, "User doesn't exist");
    return this.prismaUser.update({
      where: { id: user.id },
      data: { gameScreenshot: screenshot },
    });
  }

  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.createdAt = new Date();
    return this.prismaUser.create({
      data: createUserDto,
    });
  }

  async findByAddress(address1: string): Promise<IUser | null> {
    return this.prismaUser.findUnique({ where: { address: `${address1}`, blocked: false }, include: { userCourses: true } });
  }

  async update(uid: string, data: UpdateUserDto): Promise<IUser> {
    const { sendMail, ...updatedData } = data;
    const user = await this.findOneById(uid);

    return await this.prismaUser.update({
      where: { id: uid, blocked: false },
      data: {
        ...updatedData,
        flags: {
          ...user.flags,
          email_notification: sendMail,
        },
      },
    });
  }
  async userToAddmin(uid: string, pass: string): Promise<IUser> {
    if (pass !== SUPER_ADMIN_PASS) {
      throw new HttpException(403, 'Forbidden');
    }
    return await this.prismaUser.update({
      where: { id: uid, blocked: false },
      data: { isAdmin: true },
    });
  }

  async adminToUser(uid: string, pass: string): Promise<IUser> {
    if (pass !== SUPER_ADMIN_PASS) {
      throw new HttpException(403, 'Forbidden');
    }
    return await this.prismaUser.update({
      where: { id: uid, blocked: false },
      data: { isAdmin: false },
    });
  }
  async deleteUserById(uid: string, pass: string): Promise<IUser> {
    if (pass !== SUPER_ADMIN_PASS) {
      throw new HttpException(403, 'Forbidden');
    }
    const findUser: IUser = await this.prismaUser.findUnique({ where: { id: `${uid}` } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const deleteUserData = await this.prismaUser.delete({ where: { id: `${uid}` } });
    return deleteUserData;
  }

  async updateGame(username: string, userId: string, game: Record<string, any>, pointsUsed: number): Promise<User> {
    const user = await this.findOneById(userId);
    if (user.username !== username) throw new HttpException(403, 'Forbidden');
    if (pointsUsed < 0) throw new HttpException(400, 'Bad Reqeust');
    if (user.ngc - pointsUsed < 0) throw new HttpException(400, 'Not enough points');
    const newScore = user.ngc - pointsUsed;
    return this.prismaUser.update({
      where: { id: user.id },
      data: { game, ngc: newScore },
    });
  }

  // services/user.service.ts

public async leaderBoard(): Promise<any[]> {
  // Step 1: Get the top users
  const basicUsers = await this.prismaUser.findMany({
    where:    { blocked: false },
    orderBy:  { top_points: 'desc' },
    take:     100,
    select:   {
      id:         true,
      firstname:  true,
      lastname:   true,
      username:   true,
      image:      true,
      ngc:        true,
      top_points: true,
    },
  });

  // Step 2: Enrich each user with completedCourses
  const usersWithCourses = await Promise.all(
    basicUsers.map(async user => {
      const completedCourses = await this.prisma.course.findMany({
        where: {
          userCourses: {
            some: {
              user_id:  user.id,
              end_time: { not: null },
            },
          },
          lecture: {
            every: {
              userLecture: {
                some: {
                  user_id: user.id,
                  end_at:  { not: null },
                },
              },
            },
          },
        },
        include: {
          lecture: {
            include: { question: true },
          },
          teacher:          true,
          userCourses:      true,
          UserQuestionAnswer: {
            include: { question: true, answer: true },
          },
          CourseStatusLog:  true,
        },
      });

      const countsByCourse = await this.prisma.userCoursesMapping.groupBy({
        by:    ['course_id'],
        where: { course_id: { in: completedCourses.map(c => c.id) } },
        _count: { start_time: true, end_time: true },
      });

      const completedWithCounts = completedCourses.map(course => {
        const countsEntry = countsByCourse.find(c => c.course_id === course.id)
          ?? { course_id: course.id, _count: { start_time: 0, end_time: 0 } };

        const total_score = course.lecture
          .reduce((sum, lec) => sum + lec.question.length * 10, 0);

        const is_version = course.parent_version_id !== course.id;

        return {
          ...course,
          counts: {
            course_id: course.id,
            _count: {
              start_time: countsEntry._count.start_time,
              end_time:   countsEntry._count.end_time,
            },
          },
          total_score,
          is_version,
        };
      });

      return {
        ...user,
        completedCourses: completedWithCounts,
      };
    })
  );

  return usersWithCourses;
}

  ///////////////////////////////////////////////////////////////
  public async assignUsernamesToOldUsers(): Promise<any[]> {
    // Fetch users without a username
    const usersWithoutUsername = await this.prismaUser.findMany({
      where: { username: null }, // Identify users without a username
    });

    // If no such users exist, return early
    if (!usersWithoutUsername.length) {
      return [];
    }

    // Generate and update usernames for these users
    const updatedUsers = [];
    for (const user of usersWithoutUsername) {
      const newUsername = await this.generateUniqueUsername();
      const updatedUser = await this.prismaUser.update({
        where: { id: user.id },
        data: { username: newUsername },
      });
      updatedUsers.push(updatedUser);
    }

    return updatedUsers;
  }

  // Generate unique username
  private async generateUniqueUsername(): Promise<string> {
    let unique = false;
    let username = '';

    while (!unique) {
      username = `user_${Math.random().toString(36).substring(2, 10)}`;
      const existingUser = await this.prismaUser.findFirst({ where: { username } });
      if (!existingUser) {
        unique = true;
      }
    }

    return username;
  }
  //////////////get users by username
  public async findUserByUsername(username: string): Promise<any | null> {
    // Query the database to find the user by username
    const user = await this.prismaUser.findFirst({
      where: { username, blocked: false },
    });

    if (!user) {
      throw new Error(`User with name "${username}" not found`);
    }

    // Query completed courses for the student and include all related data
    const completedCourses = await this.prisma.course.findMany({
      where: {
        userCourses: {
          some: {
            user_id: user.id,
            end_time: { not: null },
          },
        },
        lecture: {
          every: {
            userLecture: {
              some: {
                user_id: user.id,
                end_at: { not: null },
              },
            },
          },
        },
      },
      include: {
        lecture: {
          include: { question: true }, // need question count per lecture for total_score
        },
        teacher: true,
        userCourses: true,
        UserQuestionAnswer: {
          include: {
            question: true,
            answer: true,
          },
        },
        CourseStatusLog: true,
      },
    });

    // 2️ Count students per completed course
    const countsByCourse = await this.prisma.userCoursesMapping.groupBy({
      by: ['course_id'],
      where: {
        course_id: { in: completedCourses.map(c => c.id) },
      },
      _count: {
        start_time: true,
        end_time: true,
      },
    });

    // 3️ Merge counts + total_score + is_version into each course
    const completedWithCounts = completedCourses.map(course => {
      // lookup or default counts entry
      const countsEntry = countsByCourse.find(c => c.course_id === course.id) || {
        course_id: course.id,
        _count: { start_time: 0, end_time: 0 },
      };

      // compute total_score: 10 points per question in all lectures
      const total_score = course.lecture.reduce((sum, lec) => sum + lec.question.length * 10, 0);

      // determine if this record is a version of another course
      const is_version = course.parent_version_id !== course.id;

      return {
        ...course,
        counts: {
          course_id: countsEntry.course_id,
          _count: {
            start_time: countsEntry._count.start_time,
            end_time: countsEntry._count.end_time,
          },
        },
        total_score,
        is_version,
      };
    });

    return {
      ...user,
      completedCourses: completedWithCounts,
    };
  }
  public async isUsernameAvailable(username: string, id: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: { username, AND: { NOT: { id } } },
    });

    return !user; // Returns true if user is not found (available)
  }
}

// const linkedin = userData.linkedin;
// const score = userData.score;
// const name = userData.name;
// const phone = userData.phone;
// const about = userData.about;
// const slug = userData.slug;
// const address = userData.address;
// const signature = userData.signature;
// const message = userData.message;
// console.log(userData);
// console.log(name);
// console.log(phone);
// const user: User = await this.prismaUser.upsert({
//   where: { address },
//   create: {
//     name,
//     address,
//     signature,
//     message,
//     about,
//     phone: phone ?? undefined, // Handle optional phone
//     slug,
//     linkedin,score,

//   },
//   update: {
//     message,
//     signature
//   }
// });

// public async updateUser(userId: number, userData: CreateUserDto): Promise<User> {
//   const findUser: User = await this.user.findUnique({ where: { id: userId } });
//   if (!findUser) throw new HttpException(409, "User doesn't exist");

//   const hashedPassword = await hash(userData.password, 10);
//   const updateUserData = await this.user.update({ where: { id: userId }, data: { ...userData, password: hashedPassword } });
//   return updateUserData;
// }

// public async deleteUser(userId: number): Promise<User> {
//   const findUser: User = await this.user.findUnique({ where: { id: userId } });
//   if (!findUser) throw new HttpException(409, "User doesn't exist");

//   const deleteUserData = await this.user.delete({ where: { id: userId } });
//   return deleteUserData;
// }

// private async initNear() {
//   const nearConfig: NearConfig = {
//     networkId: 'testnet',
//     keyStore: new nearAPI.keyStores.InMemoryKeyStore(),
//     nodeUrl: 'https://rpc.testnet.near.org',
//   };
//   const near = await nearAPI.connect(nearConfig);
//   return near;
// }
