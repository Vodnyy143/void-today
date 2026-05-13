import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const InviteMemberSchema = z.object({
  email: z.string(),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

export class InviteMemberDto extends createZodDto(InviteMemberSchema) {}
