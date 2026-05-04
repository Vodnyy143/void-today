import { Module } from '@nestjs/common';

import { GoalsService } from '@modules/goals/goals.service';
import { GoalsController } from '@modules/goals/goals.controller';
import { PrismaModule } from '@core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [GoalsService],
  controllers: [GoalsController],
})
export class GoalsModule {}
