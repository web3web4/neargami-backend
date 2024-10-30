import { PrismaClient, Claims } from '@prisma/client';
import { Service } from 'typedi';
import { HttpException } from '@/exceptions/HttpException';
import { connect, WalletConnection, keyStores, KeyPair, Contract } from 'near-api-js';
import { PRIVATE_KEY } from '@/config';
import { KeyPairString } from 'near-api-js/lib/utils';
@Service()
export class ClaimsService {
  private claims = new PrismaClient().claims;
  private nearConfig;
  private near;
  private CONTRACT_ACCOUNT = '0b33f9bba623b149eda8dfb13f255197abf9f6459dd2386a52ed0bbd668d48ef';
  private OWNER_ACCOUNT = '0b33f9bba623b149eda8dfb13f255197abf9f6459dd2386a52ed0bbd668d48ef';
  private keyPair = KeyPair.fromString(PRIVATE_KEY as KeyPairString);

  constructor() {
    this.nearConfig = {
      networkId: 'mainnet',
      keyStore: new keyStores.InMemoryKeyStore(),
      nodeUrl: 'https://rpc.mainnet.near.org',
      walletUrl: 'https://wallet.mainnet.near.org',
      helperUrl: 'https://helper.mainnet.near.org',
      explorerUrl: 'https://explorer.mainnet.near.org',
    };
    this.initNear();
  }
  private async initNear() {
    this.near = await connect(this.nearConfig);
  }

  public async findAll(isAdmin: boolean): Promise<Claims[]> {
    if (!isAdmin) {
      throw new HttpException(401, 'Unauthorized');
    }
    const claims: Claims[] = await this.claims.findMany({
      include: { user: { select: { address: true, ngc: true } } },
    });
    return claims;
  }

  private async transferTokens(receiver_id: string, amount: string, memo = 'Minted by Neargami.com') {
    await this.nearConfig.keyStore.setKey('mainnet', this.OWNER_ACCOUNT, this.keyPair);

    const account = await this.near.account(this.OWNER_ACCOUNT);
    const contract = new Contract(account, this.CONTRACT_ACCOUNT, {
      viewMethods: [],
      changeMethods: ['ft_transfer'],
    } as any);
    // const value = BigInt(amount);
    return await (contract as any).ft_transfer({ receiver_id, amount, memo });
  }

  public async execute(isAdmin: boolean) {
    if (!isAdmin) {
      throw new HttpException(401, 'Unauthorized');
    }
    const claims: any = await this.claims.findMany({
      where: { executed: false },
      include: { user: { select: { address: true, ngc: true } } },
    });

    for (const claim of claims) {
      await this.transferTokens(claim.user.address, claim.ngc_claimed.toString() + '000000000000000000');
      await this.claims.update({ where: { id: claim.id }, data: { executed: true } });
    }
    return;
  }
}
