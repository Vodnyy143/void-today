import { Module } from '@nestjs/common';

import { PrismaModule } from '@core/prisma/prisma.module';
import { StatsService } from '@modules/stats/stats.service';
import { StatsController } from '@modules/stats/stats.controller';

@Module({
  imports: [PrismaModule],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}
