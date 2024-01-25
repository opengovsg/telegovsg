import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseService } from './database.service'
import { PgDatabaseService } from './pgdatabase.service'

export const databaseServiceProvider = {
  provide: DatabaseService,
  useClass: PgDatabaseService,
}

@Global()
@Module({
  imports: [ConfigModule],
  providers: [databaseServiceProvider],
  exports: [databaseServiceProvider],
})
export class DatabaseModule {}
