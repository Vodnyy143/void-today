import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { SprintStatus, TaskStatus } from '@generated/prisma/enums';
import { CreateSprintDto } from '@modules/sprints/dtos/create-sprint.dto';
import { UpdateSprintDto } from '@modules/sprints/dtos/update-sprint.dto';
import { AddTasksToSprintDto } from '@modules/sprints/dtos/add-tasks.dto';
import { NotificationsService } from '@modules/notifications/notifications.service';

@Injectable()
export class SprintsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateSprintDto) {
    await this.checkProjectAccess(userId, dto.projectId);

    if (dto.startDate && dto.endDate) {
      const activeSprint = await this.prisma.sprint.findFirst({
        where: {
          projectId: dto.projectId,
          status: SprintStatus.ACTIVE,
        },
      });

      if (activeSprint) {
        throw new BadRequestException(
          `В проекте уже есть активный спринт "${activeSprint.name}". Завершите его перед запуском нового.`,
        );
      }
    }

    return this.prisma.sprint.create({
      data: {
        name: dto.name,
        projectId: dto.projectId,
        goal: dto.goal,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        status: SprintStatus.PLANNED,
      },
      include: {
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: { select: { tasks: true } },
      },
    });
  }

  async findAllByProject(userId: string, projectId: string) {
    await this.checkProjectAccess(userId, projectId);

    return this.prisma.sprint.findMany({
      where: { projectId },
      include: {
        _count: { select: { tasks: true } },
        tasks: {
          select: { id: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, sprintId: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
      include: {
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true, avatar: true },
            },
            creator: {
              select: { id: true, name: true, email: true },
            },
            checkpoints: { orderBy: { order: 'asc' } },
            category: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { tasks: true } },
      },
    });

    if (!sprint) throw new NotFoundException('Спринт не найден');

    await this.checkProjectAccess(userId, sprint.projectId);

    return sprint;
  }

  async update(userId: string, sprintId: string, dto: UpdateSprintDto) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
    });
    if (!sprint) throw new NotFoundException('Спринт не найден');

    await this.checkProjectAccess(userId, sprint.projectId, ['MANAGER']);

    if (sprint.status === SprintStatus.COMPLETED) {
      throw new BadRequestException('Нельзя редактировать завершённый спринт');
    }

    return this.prisma.sprint.update({
      where: { id: sprintId },
      data: {
        name: dto.name,
        goal: dto.goal,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        _count: { select: { tasks: true } },
      },
    });
  }

  async delete(userId: string, sprintId: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
    });
    if (!sprint) throw new NotFoundException('Спринт не найден');

    await this.checkProjectAccess(userId, sprint.projectId, ['MANAGER']);

    if (sprint.status === SprintStatus.ACTIVE) {
      throw new BadRequestException(
        'Нельзя удалить активный спринт. Сначала завершите его.',
      );
    }

    // Убираем привязку задач к спринту перед удалением
    await this.prisma.task.updateMany({
      where: { sprintId },
      data: { sprintId: null },
    });

    return this.prisma.sprint.delete({ where: { id: sprintId } });
  }

  // ─── Управление статусом ─────────────────────────────────────────────────────

  async start(userId: string, sprintId: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
    });
    if (!sprint) throw new NotFoundException('Спринт не найден');

    await this.checkProjectAccess(userId, sprint.projectId, ['MANAGER']);

    if (sprint.status !== SprintStatus.PLANNED) {
      throw new BadRequestException(
        sprint.status === SprintStatus.ACTIVE
          ? 'Спринт уже запущен'
          : 'Нельзя запустить завершённый спринт',
      );
    }

    // Проверяем нет ли другого активного спринта в проекте
    const activeSprint = await this.prisma.sprint.findFirst({
      where: {
        projectId: sprint.projectId,
        status: SprintStatus.ACTIVE,
        id: { not: sprintId },
      },
    });

    if (activeSprint) {
      throw new BadRequestException(
        `В проекте уже есть активный спринт "${activeSprint.name}". Завершите его перед запуском нового.`,
      );
    }

    const now = new Date();

    const updatedSprint = await this.prisma.sprint.update({
      where: { id: sprintId },
      data: {
        status: SprintStatus.ACTIVE,
        startDate: sprint.startDate ?? now,
      },
      include: {
        _count: { select: { tasks: true } },
      },
    });

    const members = await this.prisma.projectMember.findMany({
      where: { projectId: sprint.projectId },
      select: { userId: true },
    });
    const project = await this.prisma.project.findUnique({
      where: { id: sprint.projectId },
      select: { name: true },
    });

    await this.notificationsService.notifySprintStart(
      members.map((m) => m.userId),
      sprint.name,
      project?.name ?? 'проекте',
    );

    return updatedSprint;
  }

  async complete(userId: string, sprintId: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
      include: { tasks: true },
    });
    if (!sprint) throw new NotFoundException('Спринт не найден');

    await this.checkProjectAccess(userId, sprint.projectId, ['MANAGER']);

    if (sprint.status !== SprintStatus.ACTIVE) {
      throw new BadRequestException(
        sprint.status === SprintStatus.PLANNED
          ? 'Спринт ещё не запущен'
          : 'Спринт уже завершён',
      );
    }

    const now = new Date();
    const undoneTasks = sprint.tasks.filter(
      (t) => t.status !== TaskStatus.DONE,
    );

    if (undoneTasks.length > 0) {
      await this.prisma.task.updateMany({
        where: { sprintId, status: { not: TaskStatus.DONE } },
        data: { sprintId: null },
      });
    }

    const completed = await this.prisma.sprint.update({
      where: { id: sprintId },
      data: {
        status: SprintStatus.COMPLETED,
        endDate: sprint.endDate ?? now,
      },
      include: {
        tasks: { select: { id: true, status: true } },
        _count: { select: { tasks: true } },
      },
    });

    // ── считаем до отправки уведомления ──
    const completionRate =
      sprint.tasks.length > 0
        ? Math.round(
            ((sprint.tasks.length - undoneTasks.length) / sprint.tasks.length) *
              100,
          )
        : 0;

    // ── получаем members до отправки уведомления ──
    const members = await this.prisma.projectMember.findMany({
      where: { projectId: sprint.projectId },
      select: { userId: true },
    });

    await this.notificationsService.notifySprintEnd(
      members.map((m) => m.userId),
      sprint.name,
      completionRate,
    );

    return {
      sprint: completed,
      summary: {
        totalTasks: sprint.tasks.length,
        completedTasks: sprint.tasks.filter((t) => t.status === TaskStatus.DONE)
          .length,
        movedToBacklog: undoneTasks.length,
        completionRate,
      },
    };
  }

  // ─── Задачи спринта ──────────────────────────────────────────────────────────

  async addTasks(userId: string, sprintId: string, dto: AddTasksToSprintDto) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
    });
    if (!sprint) throw new NotFoundException('Спринт не найден');

    await this.checkProjectAccess(userId, sprint.projectId);

    if (sprint.status === SprintStatus.COMPLETED) {
      throw new BadRequestException(
        'Нельзя добавлять задачи в завершённый спринт',
      );
    }

    // Проверяем что все задачи принадлежат тому же проекту
    const tasks = await this.prisma.task.findMany({
      where: { id: { in: dto.taskIds } },
    });

    const wrongProject = tasks.filter((t) => t.projectId !== sprint.projectId);
    if (wrongProject.length > 0) {
      throw new BadRequestException(
        'Одна или несколько задач не принадлежат проекту этого спринта',
      );
    }

    await this.prisma.task.updateMany({
      where: { id: { in: dto.taskIds } },
      data: { sprintId },
    });

    return this.findOne(userId, sprintId);
  }

  async removeTask(userId: string, sprintId: string, taskId: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
    });
    if (!sprint) throw new NotFoundException('Спринт не найден');

    await this.checkProjectAccess(userId, sprint.projectId);

    if (sprint.status === SprintStatus.COMPLETED) {
      throw new BadRequestException(
        'Нельзя удалять задачи из завершённого спринта',
      );
    }

    await this.prisma.task.update({
      where: { id: taskId },
      data: { sprintId: null },
    });

    return { success: true };
  }

  async getBacklog(userId: string, projectId: string) {
    await this.checkProjectAccess(userId, projectId);

    return this.prisma.task.findMany({
      where: {
        projectId,
        sprintId: null,
        status: { not: TaskStatus.DONE },
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        checkpoints: { orderBy: { order: 'asc' } },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(userId: string, sprintId: string) {
    const sprint = await this.findOne(userId, sprintId);

    const tasks = sprint.tasks;
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === TaskStatus.DONE).length;
    const inProgress = tasks.filter(
      (t) => t.status === TaskStatus.IN_PROGRESS,
    ).length;
    const review = tasks.filter((t) => t.status === TaskStatus.REVIEW).length;
    const todo = tasks.filter((t) => t.status === TaskStatus.TODO).length;

    // Burndown: сколько задач оставалось на каждый день спринта
    const burndown: { date: string; remaining: number }[] = [];

    if (sprint.startDate && sprint.endDate) {
      const start = new Date(sprint.startDate);
      const end = new Date(sprint.endDate);
      const dayMs = 1000 * 60 * 60 * 24;
      const days = Math.ceil((end.getTime() - start.getTime()) / dayMs) + 1;

      for (let i = 0; i < days; i++) {
        const date = new Date(start.getTime() + i * dayMs);
        const dateStr = date.toISOString().split('T')[0];

        const completedByDate = tasks.filter(
          (t) =>
            t.completedAt &&
            new Date(t.completedAt).getTime() <= date.getTime() + dayMs,
        ).length;

        burndown.push({
          date: dateStr,
          remaining: total - completedByDate,
        });
      }
    }

    // Разбивка по исполнителям
    const byAssignee = tasks.reduce(
      (acc, task) => {
        const key = task.assigneeId ?? 'unassigned';
        const name = task.assignee
          ? (task.assignee.name ?? task.assignee.email)
          : 'Без исполнителя';

        if (!acc[key]) {
          acc[key] = { name, total: 0, done: 0 };
        }
        acc[key].total++;
        if (task.status === TaskStatus.DONE) acc[key].done++;
        return acc;
      },
      {} as Record<string, { name: string; total: number; done: number }>,
    );

    return {
      sprintId: sprint.id,
      sprintName: sprint.name,
      status: sprint.status,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      total,
      done,
      inProgress,
      review,
      todo,
      completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
      burndown,
      byAssignee: Object.values(byAssignee),
    };
  }

  private async checkProjectAccess(
    userId: string,
    projectId: string,
    allowedRoles?: string[],
  ) {
    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: { userId, projectId },
      },
    });

    if (!member) {
      throw new ForbiddenException('Вы не являетесь участником проекта');
    }

    if (allowedRoles && !allowedRoles.includes(member.role)) {
      throw new ForbiddenException(
        `Требуется роль: ${allowedRoles.join(' или ')}`,
      );
    }

    return member;
  }
}
