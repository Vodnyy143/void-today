import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateSprintSchema = z.object({
  name: z.string().min(1).max(100),
  projectId: z.string(),
  goal: z.string().max(500).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export class CreateSprintDto extends createZodDto(CreateSprintSchema) {}
