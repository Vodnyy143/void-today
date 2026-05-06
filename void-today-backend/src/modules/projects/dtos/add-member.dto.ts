import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const addMemberSchema = z.object({
  userId: z.string(),
});

export class AddMemberDto extends createZodDto(addMemberSchema) {}
