import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const signUpSchema = z.object({
  email: z.string(),
  password: z.string(),
  name: z.string(),
});

export class SignUpDto extends createZodDto(signUpSchema) {}
