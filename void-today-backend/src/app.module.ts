import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EnvModule } from '@core/env/env.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { AuthModule } from '@modules/auth/auth.module';
import { TasksModule } from '@modules/tasks/tasks.module';
import { CategoriesModule } from '@modules/categories/categories.module';
import { GoalsModule } from '@modules/goals/goals.module';
import { NotesModule } from '@modules/notes/notes.module';
import { MoodsModule } from '@modules/moods/moods.module';
import { StatsModule } from '@modules/stats/stats.module';
import { ProjectsModule } from '@modules/projects/projects.module';
import { UsersModule } from '@modules/users/users.module';

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
    MoodsModule,
    StatsModule,
    ProjectsModule,
    UsersModule,
  ],
})
export class AppModule {}
