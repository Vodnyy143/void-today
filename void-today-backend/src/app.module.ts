import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EnvModule } from '@core/env/env.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { AuthModule } from '@modules/auth/auth.module';
import { TasksModule } from '@modules/tasks/tasks.module';
import { CategoriesModule } from '@modules/categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    EnvModule,
    AuthModule,
    TasksModule,
    CategoriesModule,
  ],
})
export class AppModule {}
