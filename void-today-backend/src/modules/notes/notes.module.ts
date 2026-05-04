import { Module } from '@nestjs/common';

import { PrismaModule } from '@core/prisma/prisma.module';
import { NotesService } from '@modules/notes/notes.service';
import { NotesController } from '@modules/notes/notes.controller';

@Module({
  imports: [PrismaModule],
  providers: [NotesService],
  controllers: [NotesController],
})
export class NotesModule {}
