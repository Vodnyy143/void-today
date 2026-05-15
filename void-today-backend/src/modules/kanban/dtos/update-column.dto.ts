import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateColumnSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  order: z.number().int().min(0).optional(),
  wipLimit: z.number().int().min(1).optional().nullable(),
});

export class UpdateColumnDto extends createZodDto(UpdateColumnSchema) {}
