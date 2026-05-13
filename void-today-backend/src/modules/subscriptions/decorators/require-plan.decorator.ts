import { SubscriptionPlan } from '@generated/prisma/enums';
import { SetMetadata } from '@nestjs/common';

export const PLAN_KEY = 'required_plan';
export const RequirePlan = (plan: SubscriptionPlan) =>
  SetMetadata(PLAN_KEY, plan);
