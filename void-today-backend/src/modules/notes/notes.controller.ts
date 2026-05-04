import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { NotesService } from '@modules/notes/notes.service';
import { GetUserId } from '@common/decorators/get-user.decorator';
import { CreateNoteDto } from '@modules/notes/dtos/create-note.dto';
import { GetNotesQueryDto } from '@modules/notes/dtos/get-notes-query.dto';
import { UpdateNoteDto } from '@modules/notes/dtos/update-note.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@GetUserId() userId: string, @Body() dto: CreateNoteDto) {
    return this.notesService.create(userId, dto);
  }

  @Get()
  async findAll(@GetUserId() userId: string, @Query() query: GetNotesQueryDto) {
    return this.notesService.findAll(userId, query);
  }

  @Get('shopping-list')
  async getShoppingList(@GetUserId() userId: string) {
    return this.notesService.getShoppingList(userId);
  }

  @Get('shopping-list/stats')
  async getShoppingStats(@GetUserId() userId: string) {
    return this.notesService.getShoppingStats(userId);
  }

  @Get('wishlist')
  async getWishlist(@GetUserId() userId: string) {
    return this.notesService.getWishlist(userId);
  }

  @Get('articles')
  async getArticles(@GetUserId() userId: string) {
    return this.notesService.getArticles(userId);
  }

  @Get('thoughts')
  async getThoughts(@GetUserId() userId: string) {
    return this.notesService.getThoughts(userId);
  }

  @Get('tags/:tag')
  async findByTag(@Param('tag') tag: string, @GetUserId() userId: string) {
    return this.notesService.findByTag(userId, tag);
  }

  @Get(':id')
  async findOne(@Param('id') noteId: string, @GetUserId() userId: string) {
    return this.notesService.findOne(noteId, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') noteId: string,
    @GetUserId() userId: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.update(noteId, userId, dto);
  }

  @Delete(':id')
  async delete(@Param('id') noteId: string, @GetUserId() userId: string) {
    return this.notesService.delete(noteId, userId);
  }
}
