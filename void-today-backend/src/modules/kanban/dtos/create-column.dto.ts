import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateColumnSchema = z.object({
  name: z.string().min(1).max(100),
  order: z.number().int().min(0).optional(),
  wipLimit: z.number().int().min(1).optional().nullable(),
});

export class CreateColumnDto extends createZodDto(CreateColumnSchema) {}
