import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from '../bot/bot.module';
import { botEnvConfig, sgidEnvConfig } from '../config/env.config';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env.example'],
          load: [sgidEnvConfig, botEnvConfig],
        }),
        TelegrafModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            token: configService.get<string>('bot.token'),
            launchOptions: {
              webhook: {
                domain: configService.get<string>('bot.domain'),
                hookPath: configService.get<string>('bot.path'),
              },
            },
            include: [BotModule],
          }),
        }),
      ],
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => key),
          },
        },
      ],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
