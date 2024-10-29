import { Claims, PrismaClient, User } from '@prisma/client';
import Container, { Service } from 'typedi';
import { CreateUserDto } from '@dtos/users.dto';
import { UpdateUserDto } from '@dtos/users.dto';
import { IUser } from '@/interfaces/user.interface';
import { HttpException } from '@/exceptions/HttpException';
import { PrismaService } from './prisma.service';

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
    const user = await this.prismaUser.findFirst({ where: { id }, select: { ngc: true } });
    return user.ngc;
  }

  public async getTopPoints(id: string): Promise<number> {
    const user = await this.prismaUser.findFirst({ where: { id }, select: { top_points: true } });
    return user.top_points;
  }

  public async findAllUser(): Promise<any> {
    const allUsers = await this.prismaUser.findMany({
      omit: { address: true, message: true, signature: true },
    });
    return allUsers;
  }
  public async findOneById(uid: string): Promise<User> {
    if (!this.isValidUUID(uid)) throw new HttpException(400, 'Invalid UUID');
    const user = this.prismaUser.findUnique({ where: { id: uid }, include: { userCourses: true } });
    if (!user) throw new HttpException(404, "User doesn't exist");
    return user;
  }

  public async getUserGame(id: string): Promise<any> {
    if (!this.isValidUUID(id)) throw new HttpException(400, 'Invalid UUID');
    const game = this.prismaUser.findUnique({ where: { id }, select: { id: true, ngc: true, game: true } });
    if (!game) throw new HttpException(404, "User doesn't exist");
    return game;
  }

  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.createdAt = new Date();
    return this.prismaUser.create({
      data: createUserDto,
    });
  }

  async findByAddress(address1: string): Promise<IUser | null> {
    return this.prismaUser.findUnique({ where: { address: `${address1}` }, include: { userCourses: true } });
  }

  async update(uid: string, data: UpdateUserDto): Promise<IUser> {
    return await this.prismaUser.update({
      where: { id: uid },
      data,
    });
  }
  async userToAddmin(uid: string): Promise<IUser> {
    return await this.prismaUser.update({
      where: { id: uid },
      data: { isAdmin: true },
    });
  }
  async deleteUserById(uid: string): Promise<IUser> {
    const findUser: IUser = await this.prismaUser.findUnique({ where: { id: `${uid}` } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const deleteUserData = await this.prismaUser.delete({ where: { id: `${uid}` } });
    return deleteUserData;
  }

  async updateGame(id: string, userId: string, game: Record<string, any>, pointsUsed: number): Promise<User> {
    const user = await this.findOneById(id);
    if (user.id !== userId) throw new HttpException(403, 'Forbidden');
    if (pointsUsed < 0) throw new HttpException(400, 'Bad Reqeust');
    if (user.ngc - pointsUsed < 0) throw new HttpException(400, 'Not enough points');
    const newScore = user.ngc - pointsUsed;
    return this.prismaUser.update({
      where: { id },
      data: { game, ngc: newScore },
    });
  }

  async leaderBoard(page: number): Promise<any> {
    const users = await this.prismaUser.findMany({
      orderBy: { top_points: 'desc' },
      select: {
        firstname: true,
        lastname: true,
        image: true,
        ngc: true,
        top_points: true,
      },
      skip: (page - 1) * 10,
      take: 10,
    });
    return users;
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
