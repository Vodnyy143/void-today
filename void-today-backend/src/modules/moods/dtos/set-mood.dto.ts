import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { MoodType } from '@generated/prisma/enums';

const setMoodSchema = z.object({
  value: z.enum([
    MoodType.DEAD,
    MoodType.OK,
    MoodType.ANGRY,
    MoodType.FIRE,
    MoodType.CHAOS,
  ]),
});

export class SetMoodDto extends createZodDto(setMoodSchema) {}
