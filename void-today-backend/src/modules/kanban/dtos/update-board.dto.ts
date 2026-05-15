import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateBoardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export class UpdateBoardDto extends createZodDto(UpdateBoardSchema) {}
