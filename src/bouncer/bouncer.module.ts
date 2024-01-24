import { Module } from '@nestjs/common';
import { BouncerService } from './bouncer.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [BouncerService],
  exports: [BouncerService],
})
export class BouncerModule {}
