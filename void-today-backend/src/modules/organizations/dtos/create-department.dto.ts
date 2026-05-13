import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createDepartmentSchema = z.object({
  name: z.string().min(1).max(255),
});

export class CreateDepartmentDto extends createZodDto(createDepartmentSchema) {}
