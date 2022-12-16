import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import * as SMTPTransport from 'nodemailer/lib/smtp-transport';

import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * Common testing code for spying on the SMTPTransport's send() implementation
 */
const spyOnSmtpSend = () => {
  return jest
    .spyOn(SMTPTransport.prototype, 'send')
    .mockImplementation(jest.fn);
};

describe('AppController', () => {
  let appController: AppController;
  let mailerService: MailerService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        MailerModule.forRoot({
          transport: 'smtp://mail@example.com:mail',
          defaults: {
            from: '"nest-modules" <modules@nestjs.com>',
          },
          template: {
            dir: join(process.cwd(), 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        }),
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    mailerService = app.get<MailerService>(MailerService);
  });

  describe('root', () => {
    it('should return send email', () => {
      spyOnSmtpSend();
      const sendMailSpy = jest.spyOn(mailerService, 'sendMail');
      appController.sendEmail();
      expect(sendMailSpy).toHaveBeenCalledTimes(1);
    });
  });
});
