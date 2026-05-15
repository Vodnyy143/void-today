import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateBoardSchema = z.object({
  name: z.string().min(1).max(100),
  projectId: z.string(),
});

export class CreateBoardDto extends createZodDto(CreateBoardSchema) {}
