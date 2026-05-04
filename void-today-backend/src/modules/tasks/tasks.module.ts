import { Module } from '@nestjs/common';

import { PrismaModule } from '@core/prisma/prisma.module';
import { TasksController } from '@modules/tasks/tasks.controller';
import { TasksService } from '@modules/tasks/tasks.service';

@Module({
  imports: [PrismaModule],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
