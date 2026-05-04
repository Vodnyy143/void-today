import { z } from 'zod';
import { Priority, RepeatType, TaskType } from '@generated/prisma/enums';
import { createZodDto } from 'nestjs-zod';

const createTaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  type: z.enum([TaskType.MICRO, TaskType.MACRO]).optional(),
  priority: z.enum([Priority.HIGH, Priority.MEDIUM, Priority.LOW]).optional(),
  dueDate: z.string().optional().nullable(),
  repeat: z
    .enum([RepeatType.NONE, RepeatType.DAILY, RepeatType.WEEKLY])
    .optional(),
  categoryId: z.string().optional().nullable(),
  goalId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  checkpoints: z
    .array(
      z.object({
        title: z.string().min(1),
      }),
    )
    .optional(),
});

export class CreateTaskDto extends createZodDto(createTaskSchema) {}
