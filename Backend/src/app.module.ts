import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { validate } from './infrastructure/config/env.validation';
import { RedisModule } from './infrastructure/redis/redis.module';
import { TraitsModule } from './modules/traits/traits.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    DatabaseModule,
    // RedisModule,
    TraitsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
