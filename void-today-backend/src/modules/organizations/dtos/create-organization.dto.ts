import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createOrganizationSchema = z.object({
  name: z.string().min(1).max(255),
  logo: z.string().optional(),
});

export class CreateOrganizationDto extends createZodDto(
  createOrganizationSchema,
) {}
