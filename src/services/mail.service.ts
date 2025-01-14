import { Service } from 'typedi';
import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { EMAIL_NAME, EMAIL_PASSWORD } from '@/config';

@Service()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: EMAIL_NAME,
        pass: EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(to: string, subject: string, templateName: string, data: any): Promise<void> {
    const templateSource = fs.readFileSync(`../templates/${templateName}.hbs`, 'utf8');

    const template = handlebars.compile(templateSource);

    const htmlContent = template(data);
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
