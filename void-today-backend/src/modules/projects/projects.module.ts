import { Module } from '@nestjs/common';

import { ProjectsService } from '@modules/projects/projects.service';
import { ProjectsController } from '@modules/projects/projects.controller';
import { PrismaModule } from '@core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
