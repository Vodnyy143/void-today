import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EnvModule } from '@core/env/env.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { AuthModule } from '@modules/auth/auth.module';
import { TasksModule } from '@modules/tasks/tasks.module';
import { CategoriesModule } from '@modules/categories/categories.module';
import { GoalsModule } from '@modules/goals/goals.module';
import { NotesModule } from '@modules/notes/notes.module';

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
    GoalsModule,
    NotesModule,
  ],
})
export class AppModule {}
