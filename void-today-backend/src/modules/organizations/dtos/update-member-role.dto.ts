import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
});

export class UpdateMemberRoleDto extends createZodDto(UpdateMemberRoleSchema) {}
