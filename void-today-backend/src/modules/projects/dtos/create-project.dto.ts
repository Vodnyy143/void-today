import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createProjectSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  orgId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
});

export class CreateProjectDto extends createZodDto(createProjectSchema) {}
