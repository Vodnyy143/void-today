import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const MoveTaskSchema = z.object({
  columnId: z.string(),
  order: z.number().int().min(0).optional(),
});

export class MoveTaskDto extends createZodDto(MoveTaskSchema) {}
