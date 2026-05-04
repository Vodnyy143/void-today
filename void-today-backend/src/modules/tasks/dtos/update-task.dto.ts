import { z } from 'zod';
import {
  Priority,
  RepeatType,
  TaskStatus,
  TaskType,
} from '@generated/prisma/enums';
import { createZodDto } from 'nestjs-zod';

const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  type: z.enum([TaskType.MICRO, TaskType.MACRO]).optional(),
  status: z
    .enum([
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS,
      TaskStatus.REVIEW,
      TaskStatus.DONE,
      TaskStatus.ARCHIVED,
    ])
    .optional(),
  priority: z.enum([Priority.HIGH, Priority.MEDIUM, Priority.LOW]).optional(),
  dueDate: z.string().optional().nullable(),
  repeat: z
    .enum([RepeatType.NONE, RepeatType.DAILY, RepeatType.WEEKLY])
    .optional(),
  categoryId: z.string().optional().nullable(),
  goalId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  kanbanColumnId: z.string().optional().nullable(),
  sprintId: z.string().optional().nullable(),
});

export class UpdateTaskDto extends createZodDto(updateTaskSchema) {}
