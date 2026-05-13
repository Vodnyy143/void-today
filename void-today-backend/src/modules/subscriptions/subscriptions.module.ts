import { Module } from '@nestjs/common';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';
import { SubscriptionController } from '@modules/subscriptions/subscriptions.controller';
import { PrismaModule } from '@core/prisma/prisma.module';
import { SubscriptionGuard } from '@modules/subscriptions/guards/subscription.guard';

@Module({
  imports: [PrismaModule],
  providers: [SubscriptionsService, SubscriptionGuard],
  controllers: [SubscriptionController],
  exports: [SubscriptionsService, SubscriptionGuard],
})
export class SubscriptionsModule {}
