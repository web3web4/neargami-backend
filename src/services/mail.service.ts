import { Service } from 'typedi';
import nodemailer from 'nodemailer';
import { BREVO_EMAIL, BREVO_KEY } from '@/config';

@Service()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: BREVO_EMAIL,
        pass: BREVO_KEY,
      },
    });
  }

  async sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
    const mailOptions = {
      from: process.env.BREVO_EMAIL,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      console.error('Error occurred:', error);
      throw error; // Re-throw the error for the caller to handle if needed
    }
  }
}
