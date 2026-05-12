import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateProjectSchema = z.object({
  name: z.string().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
});

export class UpdateProjectDto extends createZodDto(updateProjectSchema) {}
