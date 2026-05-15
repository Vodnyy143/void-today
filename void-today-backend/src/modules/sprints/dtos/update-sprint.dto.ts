import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateSprintSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  goal: z.string().max(500).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export class UpdateSprintDto extends createZodDto(UpdateSprintSchema) {}
