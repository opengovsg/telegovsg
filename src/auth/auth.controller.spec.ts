import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from '../bot/bot.module';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env.example'],
        }),
        TelegrafModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: () => ({
            token: process.env.BOT_TOKEN,
            launchOptions: {
              webhook: {
                domain: process.env.BOT_DOMAIN,
                hookPath: process.env.BOT_PATH,
              },
            },
            include: [BotModule],
          }),
        }),
      ],
      providers: [AuthService],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
