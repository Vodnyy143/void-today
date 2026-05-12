FROM node:20-alpine AS runner

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY prisma ./prisma
COPY prisma.config.ts ./

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]