import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@core/prisma/prisma.service';
import { CreateGoalDto } from '@modules/goals/dtos/create-goal.dto';
import { GetGoalsQueryDto } from '@modules/goals/dtos/get-goals-query.dto';
import { UpdateGoalDto } from '@modules/goals/dtos/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateGoalDto) {
    if (dto.parentId) {
      const parent = await this.findOne(dto.parentId, userId);
      if (!parent) {
        throw new NotFoundException('Parent goal not found');
      }
    }

    const goal = await this.prisma.goal.create({
      data: {
        title: dto.title,
        level: dto.level,
        deadline: dto.deadline,
        parentId: dto.parentId,
        categoryId: dto.categoryId,
        projectId: dto.projectId,
        userId,
      },
      include: {
        parent: true,
        children: true,
        tasks: true,
        category: true,
      },
    });

    return goal;
  }

  async findAll(userId: string, query: GetGoalsQueryDto) {
    const where: any = { userId };

    if (query.level) {
      where.level = query.level;
    }

    const goals = await this.prisma.goal.findMany({
      where,
      include: {
        parent: true,
        children: true,
        tasks: true,
        category: true,
      },
      orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
    });

    const goalsWithProgress = goals.map((goal) => ({
      ...goal,
      progress: this.calculateProgress(goal),
    }));

    return goalsWithProgress;
  }

  async findOne(goalId: string, userId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        parent: true,
        children: true,
        tasks: { include: { checkpoints: true } },
        category: true,
        project: true,
      },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    return {
      ...goal,
      progress: this.calculateProgress(goal),
    };
  }

  async update(goalId: string, userId: string, dto: UpdateGoalDto) {
    const goal = await this.findOne(goalId, userId);

    if (dto.parentId && dto.parentId !== goal.parentId) {
      const newParent = await this.findOne(dto.parentId, userId);
      if (!newParent) {
        throw new NotFoundException('Parent goal not found');
      }

      if (newParent.parentId === goalId) {
        throw new BadRequestException('Circular parent reference detected');
      }
    }

    const updated = await this.prisma.goal.update({
      where: { id: goalId },
      data: {
        title: dto.title,
        level: dto.level,
        deadline: dto.deadline,
        parentId: dto.parentId,
        categoryId: dto.categoryId,
        projectId: dto.projectId,
      },
      include: {
        parent: true,
        children: true,
        tasks: true,
        category: true,
      },
    });

    return {
      ...updated,
      progress: this.calculateProgress(updated),
    };
  }

  async delete(goalId: string, userId: string) {
    const goal = await this.findOne(goalId, userId);

    return this.prisma.goal.delete({
      where: { id: goalId },
    });
  }

  async linkTask(goalId: string, taskId: string, userId: string) {
    const goal = await this.findOne(goalId, userId);

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.creatorId !== userId) {
      throw new BadRequestException('Can only link your own tasks');
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: { goalId },
      include: { checkpoints: true },
    });

    await this.recalculateProgress(goalId);

    return updated;
  }

  async unlinkTask(goalId: string, taskId: string, userId: string) {
    const goal = await this.findOne(goalId, userId);

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.goalId !== goalId) {
      throw new NotFoundException('Task not found in this goal');
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: { goalId: null },
      include: { checkpoints: true },
    });

    await this.recalculateProgress(goalId);

    return updated;
  }

  private calculateProgress(goal: any): number {
    if (!goal.tasks || goal.tasks.length === 0) {
      return 0;
    }

    const completedTasks = goal.tasks.filter(
      (task) => task.status === 'DONE',
    ).length;

    return Math.round((completedTasks / goal.tasks.length) * 100);
  }

  private async recalculateProgress(goalId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
      include: { tasks: true },
    });

    if (!goal) return;

    const progress = this.calculateProgress(goal);

    await this.prisma.goal.update({
      where: { id: goalId },
      data: { progress },
    });

    if (goal.parentId) {
      await this.recalculateProgress(goal.parentId);
    }
  }

  async getGoalHierarchy(userId: string) {
    // Получаем только top-level цели (без родителя)
    const topLevelGoals = await this.prisma.goal.findMany({
      where: {
        userId,
        parentId: null,
      },
      include: {
        children: {
          include: {
            children: {
              include: {
                tasks: true,
              },
            },
            tasks: true,
          },
        },
        tasks: true,
      },
      orderBy: { deadline: 'asc' },
    });

    return topLevelGoals.map((goal) => ({
      ...goal,
      progress: this.calculateProgress(goal),
      children: goal.children.map((child) => ({
        ...child,
        progress: this.calculateProgress(child),
        children: child.children.map((grandchild) => ({
          ...grandchild,
          progress: this.calculateProgress(grandchild),
        })),
      })),
    }));
  }

  async getGoalStats(goalId: string, userId: string) {
    const goal = await this.findOne(goalId, userId);

    const totalTasks = goal.tasks.length;
    const completedTasks = goal.tasks.filter((t) => t.status === 'DONE').length;
    const inProgressTasks = goal.tasks.filter(
      (t) => t.status === 'IN_PROGRESS',
    ).length;
    const todoTasks = goal.tasks.filter((t) => t.status === 'TODO').length;

    return {
      id: goal.id,
      title: goal.title,
      level: goal.level,
      progress: goal.progress,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      childrenCount: goal.children.length,
      deadline: goal.deadline,
    };
  }
}
