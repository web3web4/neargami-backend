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

    const templateSource = fs.readFileSync(`../templates/${templateName}.hbs`, 'utf8');

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
  }
}
