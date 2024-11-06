import Container, { Service } from 'typedi';
import { randomBytes } from 'crypto';
import axios from 'axios';
import { serialize } from 'borsh';
import { utils as nearApiJsUtils } from 'near-api-js';
import { sha256 } from 'js-sha256';
import { DataStoredInToken, TokenData } from '@/interfaces/auth.interface';
import { SECRET_KEY } from '@/config';
import { sign } from 'jsonwebtoken';
import { challangelog, User } from '@prisma/client';
import { CreateUserDto } from '@/dtos/users.dto';
import { PrismaService } from './prisma.service';
import { HttpException } from '@/exceptions/HttpException';

const NETWORK_ID = process.env.NETWORK_ID ?? 'testnet';

type ChallengeObject = { message: string; nonce: string; recipient: string; callbackUrl?: string };
class Payload {
  public tag = 2147484061;
  public message: string;
  public nonce: Buffer;
  public recipient: string;
  public callbackUrl?: string;

  constructor({ message, nonce, recipient, callbackUrl }: { message: string; nonce: Buffer; recipient: string; callbackUrl?: string }) {
    this.message = message;
    this.nonce = nonce;
    this.recipient = recipient;
    if (callbackUrl) {
      this.callbackUrl = callbackUrl;
    }
  }
}

// Borsh needs a schema describing the payload
const payloadSchema = {
  struct: {
    tag: 'u32',
    message: 'string',
    nonce: { array: { type: 'u8', len: 32 } },
    recipient: 'string',
    callbackUrl: { option: 'string' },
  },
};

@Service()
export class AuthService {
  private prismaService = Container.get(PrismaService);
  private users = this.prismaService.user;
  private challangelog = this.prismaService.challangelog;
  public createChallenge(): { challange: string; message: string } {
    const challange = randomBytes(32).toString('base64');
    const message =
      'By using our service you automatically acknowledge and agree to our Privacy Policy existed at: https://neargami.com/privacy-policy and our Legal Disclaimer existed at https://neargami.com/legal-disclaimer.';
    return { challange, message };
  }
  public async createChallangeLog(accountid: string, challange1: string) {
    const newchallangelog = await this.challangelog.create({
      data: {
        accountId: accountid,
        signature: null,
        challange: challange1,
      },
    });
    return newchallangelog;
  }
  public async checkUser(accountid: string) {
    const user = await this.challangelog.findMany({ where: { accountId: accountid } });
    if (user.length == 0) {
      return 'no user';
    }
  }
  public async checkSignature(accountid: string) {
    let nullsignature: string;
    const nosignature = await this.challangelog.findMany({ where: { AND: [{ accountId: accountid }, { signature: null }] } });
    if (nosignature.length == 0) {
      nullsignature = null;
    } else {
      nullsignature = 'one value';
    }
    console.log(nullsignature);
    return nullsignature;
  }
  public async returnSameChallenge(accountid: string) {
    const challangelog = await this.challangelog.findFirst({ where: { AND: [{ accountId: accountid }, { signature: null }] } });
    const challange = challangelog.challange;
    const message =
      'By using our service you automatically acknowledge and agree to our Privacy Policy existed at: https://neargami.com/privacy-policy and our Legal Disclaimer existed at https://neargami.com/legal-disclaimer.';
    return { challange, message };
  }
  public async checkChallenge(accountId: string) {
    //check if there no challenge or if challenge is exist with signature then generate new challenge
    //if challenge exist without signature then return challenge
    const check = await this.challangelog.findMany({});
    let challange: string;
    let message: string;
    if (!check) {
      // return check[0].challange;
      challange = 'you have already challange without signature';
      message = 'you have already challange without signature';
      console.log('you have already challange without signature');
    } else {
      challange = randomBytes(32).toString('base64');
      message =
        'By using our service you automatically acknowledge and agree to our Privacy Policy existed at: https://neargami.com/privacy-policy and our Legal Disclaimer existed at https://neargami.com/legal-disclaimer.';
    }
    console.log({ challange, message });
    return { challange, message };
  }
  public async getallchallangeLog() {
    const challangelog = await this.challangelog.findMany({});
    return challangelog;
  }
  public async validateAndCreateUser({ accountId, publicKey, signature, challenge, message }, networkId = NETWORK_ID) {
    await this.ensureAuthentication({ accountId, publicKey, signature }, networkId);

    await this.challangelog.updateMany({ where: { accountId }, data: { signature } });

    const user = await this.users.upsert({
      where: { address: accountId },
      //TODO: check saving challenge field
      create: { address: accountId, message, signature, phone: challenge },
      update: { message, signature },
    });
    return user;
  }

  // Aux method
  private async fetch_all_user_keys({ accountId }, networkId) {
    try {
      const response = await axios.post(
        `https://rpc.${networkId}.near.org`,
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
  public createToken(id: string): TokenData {
    const dataStoredInToken: DataStoredInToken = { id };
    const secretKey: string = SECRET_KEY;
    const expiresIn: number = 60 * 60 * 12;

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  // public createChallenge(): { challenge: string; message: string } {
  //   const challenge = randomBytes(32).toString("base64");
  //   const message = "Login with near";
  //   return { challenge, message };
  // }
  public async ensureAuthentication({ accountId, publicKey, signature }, networkId) {
    // A user is correctly authenticated if:
    // - The key used to sign belongs to the user and is a Full Access Key
    // - The object signed contains the right message and domain
    const full_key_of_user = await this.verifyFullKeyBelongsToUser({ accountId, publicKey }, networkId);
    console.log('isAuthenticationValid(...) -> Does the public key belongs to the user?', full_key_of_user);

    const storedChallenge = await this.returnSameChallenge(accountId);
    const originalMessageObject = {
      message: storedChallenge.message,
      nonce: storedChallenge.challange,
      recipient: accountId,
    };
    const valid_signature = this.verifySignature({ publicKey, signature }, originalMessageObject);
    console.log('isAuthenticationValid(...) -> Is the Signature Valid?', valid_signature);

    if (!(valid_signature && full_key_of_user)) {
      throw new HttpException(400, 'Authentication Failed');
    }
  }

  public verifySignature({ publicKey, signature }, originalMessageObject: ChallengeObject) {
    try {
      // Reconstruct the payload that was **actually signed**
      const payload = new Payload({
        ...originalMessageObject,
        nonce: Buffer.from(originalMessageObject.nonce, 'base64'),
      });
      const borsh_payload = serialize(payloadSchema, payload);
      const to_sign = Uint8Array.from(sha256.array(borsh_payload));

      // Reconstruct the signature from the parameter given in the URL
      let real_signature = Buffer.from(signature, 'base64');

      // Use the public Key to verify that the private-counterpart signed the message
      const myPK = nearApiJsUtils.PublicKey.from(publicKey);
      return myPK.verify(to_sign, real_signature);
    } catch (error) {
      throw error;
    }
  }
  public async verifyFullKeyBelongsToUser({ publicKey, accountId }, networkId) {
    // Call the public RPC asking for all the users' keys
    const data = await this.fetch_all_user_keys({ accountId }, networkId);
    // if there are no keys, then the user could not sign it!
    if (!data || !data.result || !data.result.keys) return false;
    // check all the keys to see if we find the used_key there
    for (const k in data.result.keys) {
      if (data.result.keys[k].public_key === publicKey) {
        // Ensure the key is full access, meaning the user had to sign
        // the transaction through the wallet
        return data.result.keys[k].access_key.permission == 'FullAccess';
      }
    }
    return false; // didn't find it
  }

  public async signup(userData: CreateUserDto): Promise<User> {
    // const findUser: User = await this.users.findUnique({ where: { email: userData.email } });
    // if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);
    // const hashedPassword = await hash(userData.password, 10);
    const createUserData: Promise<User> = this.users.create({ data: userData });
    return createUserData;
  }
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
  // public createToken(user: User): TokenData {
  //   const dataStoredInToken: DataStoredInToken = { id: user.id };
  //   const secretKey: string = SECRET_KEY;
  //   const expiresIn: number = 60 * 60;
  //   return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  // }
  // public createCookie(tokenData: TokenData): string {
  //   return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  // }
}
