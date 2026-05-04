import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { GoalLevel } from '@generated/prisma/enums';

const getGoalsQuerySchema = z.object({
  level: z.enum([GoalLevel.LIFE, GoalLevel.MONTH, GoalLevel.WEEK]).optional(),
});

export class GetGoalsQueryDto extends createZodDto(getGoalsQuerySchema) {}
