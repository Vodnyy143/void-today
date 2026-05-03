import { z } from 'zod';

const envSchema = z.object({
    PORT: z.coerce.number(),
    NODE_ENV: z.string(),
    COOKIE_DOMAIN: z.string(),

    DATABASE_URL: z.string(),

    ACCESS_SECRET: z.string(),
    ACCESS_EXP: z.string(),
    REFRESH_SECRET: z.string(),
    REFRESH_EXP: z.string(),
});

export type Env = z.infer<typeof envSchema>;