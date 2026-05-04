import { z } from 'zod';
import { TaskStatus } from '@generated/prisma/enums';
import { createZodDto } from 'nestjs-zod';

const getTasksQuerySchema = z.object({
  status: z
    .enum([
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS,
      TaskStatus.REVIEW,
      TaskStatus.DONE,
      TaskStatus.ARCHIVED,
    ])
    .optional(),
  categoryId: z.string().optional(),
  goalId: z.string().optional(),
  projectId: z.string().optional(),
});

export class GetTasksQueryDto extends createZodDto(getTasksQuerySchema) {}
