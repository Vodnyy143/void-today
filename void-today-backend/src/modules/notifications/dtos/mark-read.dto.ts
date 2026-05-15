import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const MarkReadSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export class MarkReadDto extends createZodDto(MarkReadSchema) {}
