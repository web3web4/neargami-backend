import { Service } from 'typedi';
import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { EMAIL_NAME, EMAIL_PASSWORD } from '../config';

@Service()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    console.log(EMAIL_NAME, EMAIL_PASSWORD);
    this.transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_NAME,
        pass: EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(to: string, subject: string, templateName: string, data: any): Promise<void> {
    try {
      if (!to) {
        throw new Error('Missing recipient email address');
      }

      if (!subject) {
        throw new Error('Missing email subject');
      }

      if (!templateName) {
        throw new Error('Missing email template name');
      }

      if (!data) {
        throw new Error('Missing email template data');
      }
      if (!to) {
        throw new Error('Missing recipient email address');
      }

      const templateSource = fs.readFileSync(`./src/templates/${templateName}.hbs`, 'utf8');

      if (!templateSource) {
        throw new Error(`Missing template file: ${templateName}.hbs`);
      }

      const template = handlebars.compile(templateSource);

      if (!template) {
        throw new Error('Failed to compile email template');
      }

      const htmlContent = template(data);
      const mailOptions = {
        from: EMAIL_NAME,
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
    } catch (error) {
      throw error;
    }
  }
}
