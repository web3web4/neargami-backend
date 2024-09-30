import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Service } from 'typedi';
import { SECRET_KEY } from '@config';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@/exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import { randomBytes } from 'crypto';
import * as naj from 'near-api-js';
import * as js_sha256 from 'js-sha256';
import * as borsh from 'borsh';
import axios from 'axios';

@Service()
export class AuthService {
  public users = new PrismaClient().user;

  public createChallenge(): { challenge: string; message: string } {
    const challenge = randomBytes(32).toString('base64');
    const message = 'Login with near';
    return { challenge, message };
  }
  public async createUser({ accountId, publicKey, signature, challenge, message }) {
    // const full_key_of_user = await this.verifyFullKeyBelongsToUser({ accountId, publicKey });
    // const valid_signature = this.verifySignature({ publicKey, signature, accountId, challenge, message });
    const user = await this.users.upsert({
      where: { address: accountId },
      create: { address: accountId, message, signature },
      update: { message, signature },
    });
    return user;
  }
  public async authenticate({ accountId, publicKey, signature, challenge, message }) {
    // const full_key_of_user = await this.verifyFullKeyBelongsToUser({ accountId, publicKey });
    // const valid_signature = this.verifySignature({ publicKey, signature, accountId, challenge, message });
    const user = await this.users.findFirst({ where: { address: accountId } });
    return this.createToken(user.id);
  }

  private verifySignature({ publicKey, signature, accountId, challenge, message }) {
    // Reconstruct the payload that was **actually signed**
    const payload = { message: message, nonce: challenge, recipient: accountId };
    console.log(payload);
    const payloadSchema = { struct: { message: 'string', nonce: 'string', recipient: 'string' } };
    const borsh_payload = borsh.serialize(payloadSchema, payload);
    const to_sign = Uint8Array.from(js_sha256.sha256.array(borsh_payload));

    // Reconstruct the signature from the parameter given in the URL
    const real_signature = Buffer.from(signature, 'base64');

    // Use the public Key to verify that the private-counterpart signed the message
    const myPK = naj.utils.PublicKey.from(publicKey);
    return myPK.verify(to_sign, real_signature);
  }

  private async verifyFullKeyBelongsToUser({ publicKey, accountId }) {
    // Call the public RPC asking for all the users' keys
    const data = await this.fetch_all_user_keys({ accountId });

    // if there are no keys, then the user could not sign it!
    if (!data || !data.result || !data.result.keys) return false;

    // check all the keys to see if we find the used_key there
    for (const k in data.result.keys) {
      if (data.result.keys[k].public_key === publicKey) {
        // Ensure the key is full access, meaning the user had to sign
        // the transaction through the wallet
        return data.result.keys[k].access_key.permission === 'FullAccess';
      }
    }

    return false; // didn't find it
  }

  // Aux method
  private async fetch_all_user_keys({ accountId }) {
    try {
      const response = await axios.post(
        'https://rpc.testnet.near.org',
        {
          jsonrpc: '2.0',
          method: 'query',
          params: [`access_key/${accountId}`, ''],
          id: 1,
        },
        {
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        },
      );

      return response.data; // Return the data from the response
    } catch (error) {
      console.error('Error fetching user keys:', error);
      throw error; // Rethrow the error for handling upstream
    }
  }

  // public async signup(userData: CreateUserDto): Promise<User> {
  //   // const findUser: User = await this.users.findUnique({ where: { email: userData.email } });
  //   // if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

  //   // const hashedPassword = await hash(userData.password, 10);
  //   const createUserData: Promise<User> = this.users.create(userData);

  //   return createUserData;
  // }

  // public async login(userData: CreateUserDto): Promise<{ cookie: string; findUser: User }> {
  //   const findUser: User = await this.users.findUnique({ where: { email: userData.email } });
  //   if (!findUser) throw new HttpException(409, `This email ${userData.email} was not found`);

  //   const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
  //   if (!isPasswordMatching) throw new HttpException(409, "Password is not matching");

  //   const tokenData = this.createToken(findUser);
  //   const cookie = this.createCookie(tokenData);

  //   return { cookie, findUser };
  // }

  // public async logout(userData: User): Promise<User> {
  //   const findUser: User = await this.users.findFirst({ where: { email: userData.email, password: userData.password } });
  //   if (!findUser) throw new HttpException(409, "User doesn't exist");

  //   return findUser;
  // }

  public createToken(id: number): TokenData {
    const dataStoredInToken: DataStoredInToken = { id };
    const secretKey: string = SECRET_KEY;
    const expiresIn: number = 60 * 60;

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  // public createCookie(tokenData: TokenData): string {
  //   return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  // }
}
