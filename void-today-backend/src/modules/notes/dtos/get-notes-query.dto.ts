import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { NoteType } from '@generated/prisma/enums';

const getNotesQuerySchema = z.object({
  type: z.enum([
    NoteType.ARTICLE,
    NoteType.THOUGH,
    NoteType.SHOPPING,
    NoteType.WISHLIST,
  ]),
  title: z.string().optional(),
  content: z.string().optional(),
  url: z.string().optional(),
  tags: z.array(z.string()).optional(),
  done: z.boolean().optional(),
  price: z.number().positive().optional(),
  imageUrl: z.string().optional(),
});

export class GetNotesQueryDto extends createZodDto(getNotesQuerySchema) {}
