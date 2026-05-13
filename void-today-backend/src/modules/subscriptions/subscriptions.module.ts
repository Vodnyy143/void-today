import { Module } from '@nestjs/common';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';
import { SubscriptionController } from '@modules/subscriptions/subscriptions.controller';
import { PrismaModule } from '@core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SubscriptionsService],
  controllers: [SubscriptionController],
})
export class SubscriptionsModule {}
