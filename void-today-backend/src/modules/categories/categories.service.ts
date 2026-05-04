import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { UpdateCategoryDto } from '@modules/categories/dtos/update-category.dto';
import { CreateCategoryDto } from '@modules/categories/dtos/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: dto.name,
        color: dto.color || '#c0392b',
        icon: dto.icon,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(categoryId: string, userId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        tasks: { select: { id: true, title: true } },
        goals: { select: { id: true, title: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.userId !== userId) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(categoryId: string, userId: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(categoryId, userId);

    return this.prisma.category.update({
      where: { id: categoryId },
      data: {
        name: dto.name,
        color: dto.color,
        icon: dto.icon,
      },
    });
  }

  async delete(categoryId: string, userId: string) {
    const category = await this.findOne(categoryId, userId);

    return this.prisma.category.delete({
      where: { id: categoryId },
    });
  }

  async getCategoryStats(categoryId: string, userId: string) {
    const category = await this.findOne(categoryId, userId);

    const taskCount = await this.prisma.task.count({
      where: { categoryId, creatorId: userId },
    });

    const completedCount = await this.prisma.task.count({
      where: {
        categoryId,
        creatorId: userId,
        status: 'DONE',
      },
    });

    return {
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      taskCount,
      completedCount,
      completionRate:
        taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0,
    };
  }
}
