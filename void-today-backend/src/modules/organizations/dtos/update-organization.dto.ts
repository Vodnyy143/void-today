import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateOrganizationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  logo: z.string().optional(),
});

export class UpdateOrganizationDto extends createZodDto(
  UpdateOrganizationSchema,
) {}
