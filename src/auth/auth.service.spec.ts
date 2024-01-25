import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { ConfigModule } from '@nestjs/config'
import {
  botEnvConfig,
  databaseEnvConfig,
  sgidEnvConfig,
} from '../config/env.config'
import { DatabaseModule } from '../database/database.module'

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        ConfigModule.forRoot({
          envFilePath: ['.env.example'],
          load: [sgidEnvConfig, botEnvConfig, databaseEnvConfig],
        }),
      ],
      providers: [AuthService],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
