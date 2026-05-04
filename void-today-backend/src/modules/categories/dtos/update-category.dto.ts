import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color')
    .optional(),
  icon: z.string().optional(),
});

export class UpdateCategoryDto extends createZodDto(updateCategorySchema) {}
