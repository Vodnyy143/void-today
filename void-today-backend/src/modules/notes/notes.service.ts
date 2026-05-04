import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { CreateNoteDto } from '@modules/notes/dtos/create-note.dto';
import { GetNotesQueryDto } from '@modules/notes/dtos/get-notes-query.dto';
import { UpdateNoteDto } from '@modules/notes/dtos/update-note.dto';
import { NoteType } from '@generated/prisma/enums';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateNoteDto) {
    return this.prisma.note.create({
      data: {
        type: dto.type,
        title: dto.title,
        content: dto.content,
        url: dto.url,
        tags: dto.tags || [],
        done: dto.done || false,
        price: dto.price,
        imageUrl: dto.imageUrl,
        userId,
      },
    });
  }

  async findAll(userId: string, query: GetNotesQueryDto) {
    const where: any = { userId };

    if (query.type) {
      where.type = query.type;
    }

    if (query.done !== undefined) {
      where.done = query.done;
    }

    const notes = await this.prisma.note.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
    });

    return notes;
  }

  async findOne(noteId: string, userId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.userId !== userId) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async update(noteId: string, userId: string, dto: UpdateNoteDto) {
    const note = await this.findOne(noteId, userId);

    return this.prisma.note.update({
      where: { id: noteId },
      data: {
        type: dto.type,
        title: dto.title,
        content: dto.content,
        url: dto.url,
        tags: dto.tags,
        done: dto.done,
        price: dto.price,
        imageUrl: dto.imageUrl,
      },
    });
  }

  async delete(noteId: string, userId: string) {
    const note = await this.findOne(noteId, userId);

    return this.prisma.note.delete({
      where: { id: noteId },
    });
  }

  async findByTag(userId: string, tag: string) {
    return this.prisma.note.findMany({
      where: {
        userId,
        tags: {
          has: tag,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByType(userId: string, type: NoteType) {
    return this.prisma.note.findMany({
      where: {
        userId,
        type,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getShoppingList(userId: string) {
    return this.prisma.note.findMany({
      where: {
        userId,
        type: 'SHOPPING',
        done: false,
      },
      orderBy: [{ price: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getWishlist(userId: string) {
    return this.prisma.note.findMany({
      where: {
        userId,
        type: 'WISHLIST',
      },
      orderBy: [{ price: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getShoppingStats(userId: string) {
    const notes = await this.prisma.note.findMany({
      where: {
        userId,
        type: 'SHOPPING',
      },
    });

    const totalCost = notes.reduce((sum, note) => sum + (note.price || 0), 0);
    const completedCost = notes
      .filter((n) => n.done)
      .reduce((sum, note) => sum + (note.price || 0), 0);
    const totalItems = notes.length;
    const completedItems = notes.filter((n) => n.done).length;

    return {
      totalItems,
      completedItems,
      remainingItems: totalItems - completedItems,
      totalCost,
      completedCost,
      remainingCost: totalCost - completedCost,
      completionRate:
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
    };
  }

  async getArticles(userId: string) {
    return this.prisma.note.findMany({
      where: {
        userId,
        type: 'ARTICLE',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getThoughts(userId: string) {
    return this.prisma.note.findMany({
      where: {
        userId,
        type: 'THOUGH',
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
