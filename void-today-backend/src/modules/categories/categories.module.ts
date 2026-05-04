import { Module } from '@nestjs/common';

import { CategoriesController } from '@modules/categories/categories.controller';
import { PrismaModule } from '@core/prisma/prisma.module';
import { CategoriesService } from '@modules/categories/categories.service';

@Module({
  imports: [PrismaModule],
  providers: [CategoriesService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
