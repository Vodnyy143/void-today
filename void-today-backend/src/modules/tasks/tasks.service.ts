import { PrismaService } from '@core/prisma/prisma.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Priority,
  RepeatType,
  TaskStatus,
  TaskType,
} from '@generated/prisma/enums';
import { UpdateTaskDto } from '@modules/tasks/dtos/update-task.dto';
import { GetTasksQueryDto } from '@modules/tasks/dtos/get-tasks-query.dto';
import { CreateTaskDto } from '@modules/tasks/dtos/create-task.dto';
import { startOfDay, endOfDay, addDays } from 'date-fns';
import { NotificationsService } from '@modules/notifications/notifications.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type || TaskType.MICRO,
        status: TaskStatus.TODO,
        priority: dto.priority || Priority.MEDIUM,
        dueDate: dto.dueDate,
        repeat: dto.repeat || RepeatType.NONE,
        categoryId: dto.categoryId,
        goalId: dto.goalId,
        projectId: dto.projectId,
        assigneeId: dto.assigneeId,
        creatorId: userId,
        checkpoints: dto.checkpoints
          ? {
              createMany: {
                data: dto.checkpoints.map((cp, idx) => ({
                  title: cp.title,
                  order: idx,
                })),
              },
            }
          : undefined,
      },
      include: {
        checkpoints: true,
        category: true,
        goal: true,
        assignee: { select: { id: true, email: true, name: true } },
        creator: { select: { id: true, email: true, name: true } },
      },
    });

    if (dto.assigneeId && dto.assigneeId !== task.assigneeId) {
      const assigner = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      await this.notificationsService.notifyTaskAssigned(
        dto.assigneeId,
        task.title,
        assigner?.name ?? assigner?.email ?? 'Кто-то',
      );
    }

    return task;
  }

  async findAll(userId: string, query: GetTasksQueryDto) {
    const where: any = {};

    if (query.projectId) {
      const member = await this.prisma.projectMember.findUnique({
        where: { userId_projectId: { userId, projectId: query.projectId } },
      });
      if (!member) throw new ForbiddenException('Нет доступа к проекту');

      where.projectId = query.projectId;
    } else {
      where.OR = [{ creatorId: userId }, { assigneeId: userId }];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.projectId) {
      where.projectId = query.projectId;
    }

    if (query.view && query.view !== 'all') {
      const now = new Date();

      if (query.view === 'today') {
        where.dueDate = {
          gte: startOfDay(now),
          lte: endOfDay(now),
        };
      } else if (query.view === 'tomorrow') {
        const tomorrow = addDays(now, 1);
        where.dueDate = {
          gte: startOfDay(tomorrow),
          lte: endOfDay(tomorrow),
        };
      } else if (query.view === 'week') {
        const weekEnd = addDays(now, 7);
        where.dueDate = {
          gte: startOfDay(now),
          lte: endOfDay(weekEnd),
        };
      }
    }

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        checkpoints: {
          orderBy: { order: 'asc' },
        },
        assignee: { select: { id: true, email: true, name: true } },
        creator: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks;
  }

  async findOne(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        checkpoints: { orderBy: { order: 'asc' } },
        category: true,
        goal: true,
        assignee: { select: { id: true, email: true, name: true } },
        creator: { select: { id: true, email: true, name: true } },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.creatorId !== userId && task.assigneeId !== userId) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async getChaos(userId: string) {
    const tasks = await this.prisma.task.findMany({
      where: {
        creatorId: userId,
        status: TaskStatus.TODO,
        dueDate: null,
      },
      take: 10,
      include: {
        checkpoints: { orderBy: { order: 'asc' } },
        category: true,
        assignee: { select: { id: true, email: true, name: true } },
        creator: { select: { id: true, email: true, name: true } },
      },
    });

    if (tasks.length === 0) {
      return null;
    }

    return tasks[Math.floor(Math.random() * tasks.length)];
  }

  async update(taskId: string, userId: string, dto: UpdateTaskDto) {
    const task = await this.findOne(taskId, userId);

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate,
        repeat: dto.repeat,
        categoryId: dto.categoryId,
        goalId: dto.goalId,
        projectId: dto.projectId,
        assigneeId: dto.assigneeId,
        kanbanColumnId: dto.kanbanColumnId,
        sprintId: dto.sprintId,
        completedAt: dto.status === TaskStatus.DONE ? new Date() : null,
      },
      include: {
        checkpoints: { orderBy: { order: 'asc' } },
        category: true,
        goal: true,
        assignee: { select: { id: true, email: true, name: true } },
        creator: { select: { id: true, email: true, name: true } },
      },
    });

    // ── Повторение задачи при выполнении ──────────────────────────
    if (
      dto.status === TaskStatus.DONE &&
      task.status !== TaskStatus.DONE &&
      updatedTask.repeat !== RepeatType.NONE
    ) {
      const nextDate = this.getNextDueDate(
        updatedTask.dueDate,
        updatedTask.repeat,
      );

      await this.prisma.task.create({
        data: {
          title: updatedTask.title,
          description: updatedTask.description ?? undefined,
          type: updatedTask.type,
          status: TaskStatus.TODO,
          priority: updatedTask.priority,
          dueDate: nextDate,
          repeat: updatedTask.repeat,
          categoryId: updatedTask.categoryId ?? undefined,
          goalId: updatedTask.goalId ?? undefined,
          projectId: updatedTask.projectId ?? undefined,
          assigneeId: updatedTask.assigneeId ?? undefined,
          creatorId: updatedTask.creatorId,
        },
      });
    }

    if (updatedTask.checkpoints.length > 0) {
      const allDone = updatedTask.checkpoints.every((cp) => cp.done);
      if (allDone && updatedTask.status !== TaskStatus.DONE) {
        return this.prisma.task.update({
          where: { id: taskId },
          data: { status: TaskStatus.DONE, completedAt: new Date() },
          include: {
            checkpoints: { orderBy: { order: 'asc' } },
            category: true,
            goal: true,
            assignee: { select: { id: true, email: true, name: true } },
            creator: { select: { id: true, email: true, name: true } },
          },
        });
      }
    }

    if (dto.assigneeId && dto.assigneeId !== updatedTask.assigneeId) {
      const assigner = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      await this.notificationsService.notifyTaskAssigned(
        dto.assigneeId,
        updatedTask.title,
        assigner?.name ?? assigner?.email ?? 'Кто-то',
      );
    }

    if (dto.status === TaskStatus.DONE && updatedTask.creatorId !== userId) {
      const doer = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      await this.notificationsService.notifyTaskDone(
        updatedTask.creatorId,
        updatedTask.title,
        doer?.name ?? doer?.email ?? 'Кто-то',
      );
    }

    return updatedTask;
  }

  async delete(taskId: string, userId: string) {
    await this.findOne(taskId, userId);

    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }

  async toggleCheckpoint(taskId: string, checkpointId: string, userId: string) {
    await this.findOne(taskId, userId);

    const checkpoint = await this.prisma.checkPoint.findUnique({
      where: { id: checkpointId },
    });

    if (!checkpoint || checkpoint.taskId !== taskId) {
      throw new NotFoundException('Checkpoint not found');
    }

    const updated = await this.prisma.checkPoint.update({
      where: { id: checkpointId },
      data: { done: !checkpoint.done },
    });

    const allCheckpoints = await this.prisma.checkPoint.findMany({
      where: { taskId },
    });

    const allDone = allCheckpoints.every((cp) => cp.done);
    if (allDone) {
      await this.prisma.task.update({
        where: { id: taskId },
        data: { status: TaskStatus.DONE, completedAt: new Date() },
      });
    }

    return updated;
  }

  async addCheckpoint(taskId: string, userId: string, title: string) {
    await this.findOne(taskId, userId);

    const checkpoint = await this.prisma.checkPoint.create({
      data: {
        taskId,
        title,
        order: await this.prisma.checkPoint.count({ where: { taskId } }),
      },
    });

    // Меняем тип задачи на MACRO
    await this.prisma.task.update({
      where: { id: taskId },
      data: { type: TaskType.MACRO },
    });

    return checkpoint;
  }

  async deleteCheckpoint(taskId: string, checkpointId: string, userId: string) {
    await this.findOne(taskId, userId);

    await this.prisma.checkPoint.delete({ where: { id: checkpointId } });

    // Если чекпоинтов не осталось — возвращаем MICRO
    const remaining = await this.prisma.checkPoint.count({ where: { taskId } });
    if (remaining === 0) {
      await this.prisma.task.update({
        where: { id: taskId },
        data: { type: TaskType.MICRO },
      });
    }

    return { success: true };
  }

  async getTasksByProject(projectId: string, userId: string) {
    return this.prisma.task.findMany({
      where: {
        projectId,
        OR: [{ creatorId: userId }, { assigneeId: userId }],
      },
      include: {
        checkpoints: { orderBy: { order: 'asc' } },
        category: true,
        goal: true,
        assignee: { select: { id: true, email: true, name: true } },
        creator: { select: { id: true, email: true, name: true } },
      },
    });
  }

  async getTasksByGoal(goalId: string, userId: string) {
    return this.prisma.task.findMany({
      where: {
        goalId,
        creatorId: userId,
      },
      include: {
        checkpoints: { orderBy: { order: 'asc' } },
        category: true,
      },
    });
  }

  async countByStatus(userId: string, status: TaskStatus) {
    return this.prisma.task.count({
      where: {
        creatorId: userId,
        status,
      },
    });
  }

  private getNextDueDate(
    currentDueDate: Date | null,
    repeat: RepeatType,
  ): Date {
    const base = currentDueDate ?? new Date();
    const next = new Date(base);

    if (repeat === RepeatType.DAILY) {
      next.setDate(next.getDate() + 1);
    } else if (repeat === RepeatType.WEEKLY) {
      next.setDate(next.getDate() + 7);
    }

    return next;
  }
}
