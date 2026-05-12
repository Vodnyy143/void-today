import { z } from 'zod';
import { Priority, TaskStatus } from '@generated/prisma/enums';
import { createZodDto } from 'nestjs-zod';

const getTasksQuerySchema = z.object({
  view: z.enum(['today', 'tomorrow', 'week', 'all']).optional(),
  status: z
    .enum([
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS,
      TaskStatus.REVIEW,
      TaskStatus.DONE,
      TaskStatus.ARCHIVED,
    ])
    .optional(),
  priority: z.enum([Priority.LOW, Priority.MEDIUM, Priority.HIGH]).optional(),
  categoryId: z.string().optional(),
  goalId: z.string().optional(),
  projectId: z.string().optional(),
});

export class GetTasksQueryDto extends createZodDto(getTasksQuerySchema) {}
