import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ProjectRole } from '@generated/prisma/enums';

const updateMemberRoleSchema = z.object({
  role: z.enum([ProjectRole.MANAGER, ProjectRole.MEMBER]),
});

export class UpdateMemberRoleDto extends createZodDto(updateMemberRoleSchema) {}
