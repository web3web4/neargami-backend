import { Service } from 'typedi';
import { AuthStrategy } from '../interfaces/auth.interface';
import { createHash } from 'crypto';
import { HttpException } from '../exceptions/HttpException';

@Service()
export class TelegramStrategy implements AuthStrategy {
  private readonly BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  async validate(data: any): Promise<boolean> {
    try {
      const { hash, ...userData } = data;

      // Create data check string
      const dataCheckString = Object.keys(userData)
        .sort()
        .map(key => `${key}=${userData[key]}`)
        .join('\n');

      // Create secret key
      const secretKey = createHash('sha256').update(this.BOT_TOKEN).digest();

      // Calculate hash
      const calculatedHash = createHash('sha256').update(secretKey).update(dataCheckString).digest('hex');

      return calculatedHash === hash;
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
