import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const signInSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export class SignInDto extends createZodDto(signInSchema) {}
