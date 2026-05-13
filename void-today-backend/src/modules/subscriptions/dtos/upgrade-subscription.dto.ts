import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const upgradeSubscriptionSchema = z.object({
  plan: z.enum(['FREE', 'PRO', 'BUSINESS']),
  expiresAt: z.string().optional(),
});

export class UpgradeSubscriptionDto extends createZodDto(
  upgradeSubscriptionSchema,
) {}
