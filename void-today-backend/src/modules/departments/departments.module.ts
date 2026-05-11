import { Module } from '@nestjs/common';

import { PrismaModule } from '@core/prisma/prisma.module';
import { DepartmentsService } from '@modules/departments/departments.service';
import { DepartmentsController } from '@modules/departments/departments.controller';

@Module({
  imports: [PrismaModule],
  providers: [DepartmentsService],
  controllers: [DepartmentsController],
})
export class DepartmentsModule {}
