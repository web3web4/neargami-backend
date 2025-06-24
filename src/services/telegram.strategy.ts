import { Service } from 'typedi';
import { AuthStrategy } from '../interfaces/auth.interface';
import { createHash } from 'crypto';
import { HttpException } from '../exceptions/HttpException';
import { validate } from '@telegram-apps/init-data-node';

@Service()
export class TelegramStrategy implements AuthStrategy {
  private readonly TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  async validate(initDataRaw: string): Promise<any> {
    try {
      validate(initDataRaw, this.TELEGRAM_BOT_TOKEN);

      const data = new URLSearchParams(initDataRaw);
      const user = JSON.parse(decodeURIComponent(data.get('user')));

      return user;
    } catch (error) {
      throw new HttpException(401, 'Invalid Telegram authentication data');
    }
  }

  async createUser(data: any): Promise<any> {
    // Return user data from Telegram
    return {
      telegramId: data.id,
      username: data.username,
      firstName: data.first_name,
      lastName: data.last_name,
      photoUrl: data.photo_url,
      authDate: data.auth_date,
    };
  }
}
