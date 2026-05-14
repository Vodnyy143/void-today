import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionPlan } from '@generated/prisma/enums';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';
import { PLAN_KEY } from '@modules/subscriptions/decorators/require-plan.decorator';

const PLAN_HIERARCHY: Record<SubscriptionPlan, number> = {
  [SubscriptionPlan.FREE]: 0,
  [SubscriptionPlan.PRO]: 1,
  [SubscriptionPlan.BUSINESS]: 2,
};

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlan = this.reflector.getAllAndOverride<SubscriptionPlan>(
      PLAN_KEY,
      [context.getHandler(), context.getClass()],
    );
    console.log(requiredPlan);

    if (!requiredPlan) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    console.log(request.user);

    if (!userId) throw new ForbiddenException('Unauthorized');

    const subscription =
      await this.subscriptionsService.getSubscription(userId);

    const userPlan = subscription?.plan ?? SubscriptionPlan.FREE;
    console.log(userPlan);
    const hasAccess = PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[requiredPlan];
    console.log(hasAccess);
    if (!hasAccess) {
      throw new ForbiddenException(
        `Требуется план ${requiredPlan} или выше. Ваш план: ${userPlan}`,
      );
    }

    return true;
  }
}
