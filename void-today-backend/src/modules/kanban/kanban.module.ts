import { Module } from '@nestjs/common';
import { KanbanService } from '@modules/kanban/kanban.service';
import { KanbanController } from '@modules/kanban/kanban.controller';
import { PrismaModule } from '@core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [KanbanService],
  controllers: [KanbanController],
})
export class KanbanModule {}
