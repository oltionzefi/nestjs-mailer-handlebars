import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class AppService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(): Promise<void> {
    const token = '8DZjDDD59PAjAd6E26XU';
    const url = `example.com/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: 'max.mustermann@something.com',
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to our team! Confirm your Email',
      template: 'registration',
      context: {
        confirmationUrl: url,
      },
      attachments: [
        {
          filename: 'company_logo.png',
          path: join(process.cwd(), 'templates/images/company_logo.png'),
          cid: 'company_logo',
        },
      ],
    });
  }
}
