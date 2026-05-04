import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { GoalLevel } from '@generated/prisma/enums';

const createGoalSchema = z.object({
  title: z.string().min(1).max(255),
  level: z.enum([GoalLevel.LIFE, GoalLevel.MONTH, GoalLevel.WEEK]),
  deadline: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
});

export class CreateGoalDto extends createZodDto(createGoalSchema) {}
