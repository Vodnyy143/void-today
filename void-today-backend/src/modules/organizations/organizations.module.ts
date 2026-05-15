import { Module } from '@nestjs/common';

import { OrganizationsService } from '@modules/organizations/organizations.service';
import { PrismaModule } from '@core/prisma/prisma.module';
import { OrganizationsController } from '@modules/organizations/organizations.controller';
import { SubscriptionsModule } from '@modules/subscriptions/subscriptions.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';

@Module({
  imports: [PrismaModule, SubscriptionsModule, NotificationsModule],
  providers: [OrganizationsService],
  controllers: [OrganizationsController],
})
export class OrganizationsModule {}
