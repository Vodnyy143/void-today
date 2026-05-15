import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const GetNotificationsQuerySchema = z.object({
  unreadOnly: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20)),
  offset: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 0)),
});

export class GetNotificationsQueryDto extends createZodDto(
  GetNotificationsQuerySchema,
) {}
