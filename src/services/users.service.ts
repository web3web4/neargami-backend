import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { Service } from 'typedi';
import { CreateProfileDto, CreateUserDto } from '@dtos/users.dto';
import { User } from '@interfaces/users.interface';
import { HttpException } from '@/exceptions/HttpException';
import { NearConfig } from 'near-api-js/lib/near';
import * as nearAPI from 'near-api-js';

@Service()
export class UserService {
  public user = new PrismaClient().user;

  public async findAllUser(): Promise<User[]> {
    const allUser: User[] = await this.user.findMany({
      include: {
        coursesAsTeacher: true,
        coursesAsStudent: true,
      },
    });
    return allUser;
  }

  public async findUserById(userId: number): Promise<User> {
    const findUser: User = await this.user.findUnique({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public async createProfile(id: number, createProfileDto: CreateProfileDto) {
    const { userId, ...data } = createProfileDto;
    await this.findUserById(id);
    return await this.user.update({
      where: {
        id: id,
      },
      data,
    });
  }

  // private async initNear() {
  //   const nearConfig: NearConfig = {
  //     networkId: 'testnet',
  //     keyStore: new nearAPI.keyStores.InMemoryKeyStore(),
  //     nodeUrl: 'https://rpc.testnet.near.org',
  //   };
  //   const near = await nearAPI.connect(nearConfig);
  //   return near;
  // }

  private async verify() {
    return true;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    const { address, message, signature } = userData;
    const isVerified = await this.verify();
    if (!isVerified) {
      throw new HttpException(400, 'Invalid signature');
    }
    const user: User = await this.user.upsert({
      where: { address },
      create: { address, message, signature },
      update: { message, signature },
    });

    return user;
  }

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
}
