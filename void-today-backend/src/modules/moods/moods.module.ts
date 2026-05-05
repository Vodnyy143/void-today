import { Module } from '@nestjs/common';

import { MoodsService } from '@modules/moods/moods.service';
import { MoodsController } from '@modules/moods/moods.controller';
import { PrismaModule } from '@core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MoodsService],
  controllers: [MoodsController],
})
export class MoodsModule {}
