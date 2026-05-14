import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { SubscriptionPlan } from '@generated/prisma/enums';
import { UpgradeSubscriptionDto } from '@modules/subscriptions/dtos/upgrade-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSubscription(userId: string) {
    let subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      subscription = await this.prisma.subscription.create({
        data: {
          userId,
          plan: 'FREE',
        },
      });
    }

    return subscription;
  }

  async upgrade(userId: string, dto: UpgradeSubscriptionDto) {
    const existing = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (existing) {
      return this.prisma.subscription.update({
        where: { userId },
        data: {
          plan: dto.plan,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        },
      });
    }

    return this.prisma.subscription.create({
      data: {
        userId,
        plan: dto.plan,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  async downgrade(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('Подписка не найдена');
    }

    const planOrder: SubscriptionPlan[] = [
      SubscriptionPlan.FREE,
      SubscriptionPlan.PRO,
      SubscriptionPlan.BUSINESS,
    ];

    const currentIndex = planOrder.indexOf(subscription.plan);

    const newPlan =
      currentIndex > 0 ? planOrder[currentIndex - 1] : SubscriptionPlan.FREE;

    return this.prisma.subscription.update({
      where: { userId },
      data: {
        plan: newPlan,
        expiresAt: null,
      },
    });
  }

  async checkPlan(
    userId: string,
    requiredPlan: SubscriptionPlan,
  ): Promise<boolean> {
    const subscription = await this.getSubscription(userId);

    const planHierarchy: Record<SubscriptionPlan, number> = {
      [SubscriptionPlan.FREE]: 0,
      [SubscriptionPlan.PRO]: 1,
      [SubscriptionPlan.BUSINESS]: 2,
    };

    const userPlan = subscription.plan ?? SubscriptionPlan.FREE;
    return planHierarchy[userPlan] >= planHierarchy[requiredPlan];
  }
}
