import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ReorderColumnsSchema = z.object({
  columns: z
    .array(
      z.object({
        id: z.string(),
        order: z.number().int().min(0),
      }),
    )
    .min(1),
});

export class ReorderColumnsDto extends createZodDto(ReorderColumnsSchema) {}
