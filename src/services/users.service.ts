import { PrismaClient, User } from '@prisma/client';
import { Service } from 'typedi';
import { CreateUserDto } from '@dtos/users.dto';
import { UpdateUserDto } from '@dtos/users.dto';
import { IUser } from '@/interfaces/user.interface';
import { HttpException } from '@/exceptions/HttpException';

@Service()
export class UserService {
  public prisma_User = new PrismaClient().user;

  public async findAllUser(): Promise<IUser[]> {
    const allUsers: IUser[] = await this.prisma_User.findMany({
      select: {
        id: true,
        firstname: true,
        lastname: true,
        address: true,
        message: true,
        signature: true,
        phone: true,
        slug: true,
        linkedin: true,
        facebook: true,
        twitter: true,
        discord: true,
        score: true,
        about: true,
        createdAt: true,
      },
    });
    return allUsers;
  }
  public async findOneById(uid: string): Promise<User> {
    return this.prisma_User.findUnique({ where: { id: uid }, include: { userCourses: true } });
  }
  // public async findUserById(userId: string): Promise<IUser> {
  //   const findUser: IUser = await this.prismaUser.findUnique({ where: { id: userId } });
  //   if (!findUser) throw new HttpException(409, "User doesn't exist");

  //   return findUser;
  // }

  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.createdAt = new Date();
    return this.prisma_User.create({
      data: createUserDto,
    });
  }

  async findByAddress(address1: string): Promise<IUser | null> {
    return this.prisma_User.findUnique({ where: { address: `${address1}` }, include: { userCourses: true } });
  }

  async update(uid: string, data: UpdateUserDto): Promise<IUser> {
    return this.prisma_User.update({
      where: { id: `${uid}` },
      data,
    });
  }
  async deleteUserById(uid: string): Promise<IUser> {
    const findUser: IUser = await this.prisma_User.findUnique({ where: { id: `${uid}` } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const deleteUserData = await this.prisma_User.delete({ where: { id: `${uid}` } });
    return deleteUserData;
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
