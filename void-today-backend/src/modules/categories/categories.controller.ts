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
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from '@modules/categories/categories.service';
import { GetUserId } from '@common/decorators/get-user.decorator';
import { CreateCategoryDto } from '@modules/categories/dtos/create-category.dto';
import { UpdateCategoryDto } from '@modules/categories/dtos/update-category.dto';
import { JwtGuard } from '@modules/auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@GetUserId() userId: string, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(userId, dto);
  }

  @Get()
  async findAll(@GetUserId() userId: string) {
    return this.categoriesService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') categoryId: string, @GetUserId() userId: string) {
    return this.categoriesService.findOne(categoryId, userId);
  }

  @Get(':id/stats')
  async getStats(@Param('id') categoryId: string, @GetUserId() userId: string) {
    return this.categoriesService.getCategoryStats(categoryId, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') categoryId: string,
    @GetUserId() userId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(categoryId, userId, dto);
  }

  @Delete(':id')
  async delete(@Param('id') categoryId: string, @GetUserId() userId: string) {
    return this.categoriesService.delete(categoryId, userId);
  }
}
