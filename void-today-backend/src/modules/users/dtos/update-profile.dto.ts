import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  avatar: z.string().optional(),
});

export class UpdateProfileDto extends createZodDto(updateProfileSchema) {}
