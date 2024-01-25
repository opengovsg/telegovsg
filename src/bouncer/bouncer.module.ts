import { Module } from '@nestjs/common';
import { BouncerService } from './bouncer.service';

@Module({
  providers: [BouncerService],
  exports: [BouncerService],
})
export class BouncerModule {}
