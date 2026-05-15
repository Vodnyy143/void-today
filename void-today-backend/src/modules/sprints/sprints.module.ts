import { Module } from '@nestjs/common';
import { PrismaModule } from '@core/prisma/prisma.module';
import { SprintsController } from '@modules/sprints/sprints.controller';
import { SprintsService } from '@modules/sprints/sprints.service';
import { NotificationsModule } from '@modules/notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [SprintsService],
  controllers: [SprintsController],
})
export class SprintsModule {}
