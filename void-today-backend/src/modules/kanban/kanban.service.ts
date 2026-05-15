import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { TaskStatus } from '@generated/prisma/enums';
import { CreateBoardDto } from '@modules/kanban/dtos/create-board.dto';
import { UpdateBoardDto } from '@modules/kanban/dtos/update-board.dto';
import { CreateColumnDto } from '@modules/kanban/dtos/create-column.dto';
import { UpdateColumnDto } from '@modules/kanban/dtos/update-column.dto';
import { ReorderColumnsDto } from '@modules/kanban/dtos/reorder-column.dto';
import { MoveTaskDto } from '@modules/kanban/dtos/move-task.dto';

@Injectable()
export class KanbanService {
  constructor(private readonly prisma: PrismaService) {}

  async createBoard(userId: string, dto: CreateBoardDto) {
    await this.checkProjectAccess(userId, dto.projectId, ['MANAGER', 'MEMBER']);

    const board = await this.prisma.kanbanBoard.create({
      data: {
        name: dto.name,
        projectId: dto.projectId,
        columns: {
          createMany: {
            data: [
              { name: 'To Do', order: 0 },
              { name: 'In Progress', order: 1 },
              { name: 'Done', order: 2 },
            ],
          },
        },
      },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { createdAt: 'asc' },
              include: {
                assignee: {
                  select: { id: true, name: true, email: true, avatar: true },
                },
                checkpoints: { orderBy: { order: 'asc' } },
              },
            },
          },
        },
      },
    });

    return board;
  }

  async getBoardsByProject(userId: string, projectId: string) {
    await this.checkProjectAccess(userId, projectId, ['MANAGER', 'MEMBER']);

    return this.prisma.kanbanBoard.findMany({
      where: { projectId },
      include: {
        _count: { select: { columns: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getBoardById(userId: string, boardId: string) {
    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { createdAt: 'asc' },
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
            },
          },
        },
      },
    });

    if (!board) throw new NotFoundException('Доска не найдена');

    await this.checkProjectAccess(userId, board.projectId, [
      'MANAGER',
      'MEMBER',
    ]);

    return board;
  }

  async updateBoard(userId: string, boardId: string, dto: UpdateBoardDto) {
    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id: boardId },
    });
    if (!board) throw new NotFoundException('Доска не найдена');

    await this.checkProjectAccess(userId, board.projectId, ['MANAGER']);

    return this.prisma.kanbanBoard.update({
      where: { id: boardId },
      data: { name: dto.name },
      include: {
        columns: { orderBy: { order: 'asc' } },
      },
    });
  }

  async deleteBoard(userId: string, boardId: string) {
    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id: boardId },
    });
    if (!board) throw new NotFoundException('Доска не найдена');

    await this.checkProjectAccess(userId, board.projectId, ['MANAGER']);

    return this.prisma.kanbanBoard.delete({ where: { id: boardId } });
  }

  // ─── Columns ─────────────────────────────────────────────────────────────────

  async createColumn(userId: string, boardId: string, dto: CreateColumnDto) {
    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id: boardId },
      include: { columns: true },
    });
    if (!board) throw new NotFoundException('Доска не найдена');

    await this.checkProjectAccess(userId, board.projectId, ['MANAGER']);

    // WIP-лимит: проверяем что не превышен лимит колонок (опционально)
    const maxOrder = board.columns.reduce(
      (max, col) => Math.max(max, col.order),
      -1,
    );

    return this.prisma.kanbanColumn.create({
      data: {
        name: dto.name,
        boardId,
        order: dto.order ?? maxOrder + 1,
        wipLimit: dto.wipLimit ?? null,
      },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
          include: {
            assignee: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    });
  }

  async updateColumn(userId: string, columnId: string, dto: UpdateColumnDto) {
    const column = await this.prisma.kanbanColumn.findUnique({
      where: { id: columnId },
      include: { board: true },
    });
    if (!column) throw new NotFoundException('Колонка не найдена');

    await this.checkProjectAccess(userId, column.board.projectId, ['MANAGER']);

    return this.prisma.kanbanColumn.update({
      where: { id: columnId },
      data: {
        name: dto.name,
        order: dto.order,
        wipLimit: dto.wipLimit,
      },
    });
  }

  async deleteColumn(userId: string, columnId: string) {
    const column = await this.prisma.kanbanColumn.findUnique({
      where: { id: columnId },
      include: { board: true },
    });
    if (!column) throw new NotFoundException('Колонка не найдена');

    await this.checkProjectAccess(userId, column.board.projectId, ['MANAGER']);

    // Обнуляем kanbanColumnId у всех задач этой колонки
    await this.prisma.task.updateMany({
      where: { kanbanColumnId: columnId },
      data: { kanbanColumnId: null },
    });

    return this.prisma.kanbanColumn.delete({ where: { id: columnId } });
  }

  async reorderColumns(
    userId: string,
    boardId: string,
    dto: ReorderColumnsDto,
  ) {
    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id: boardId },
    });
    if (!board) throw new NotFoundException('Доска не найдена');

    await this.checkProjectAccess(userId, board.projectId, ['MANAGER']);

    // Обновляем порядок всех колонок транзакционно
    await this.prisma.$transaction(
      dto.columns.map(({ id, order }) =>
        this.prisma.kanbanColumn.update({
          where: { id },
          data: { order },
        }),
      ),
    );

    return this.getBoardById(userId, boardId);
  }

  // ─── Tasks ───────────────────────────────────────────────────────────────────

  async moveTask(userId: string, taskId: string, dto: MoveTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!task) throw new NotFoundException('Задача не найдена');

    // Проверяем что колонка существует
    const column = await this.prisma.kanbanColumn.findUnique({
      where: { id: dto.columnId },
      include: {
        board: true,
        tasks: true,
      },
    });
    if (!column) throw new NotFoundException('Колонка не найдена');

    await this.checkProjectAccess(userId, column.board.projectId, [
      'MANAGER',
      'MEMBER',
    ]);

    // Проверяем WIP-лимит
    if (column.wipLimit !== null) {
      const currentTasksInColumn = column.tasks.filter(
        (t) => t.id !== taskId,
      ).length;

      if (currentTasksInColumn >= column.wipLimit) {
        throw new BadRequestException(
          `Колонка "${column.name}" достигла WIP-лимита (${column.wipLimit} задач). Завершите или переместите задачи перед добавлением новой.`,
        );
      }
    }

    // Автоматически меняем статус задачи в зависимости от имени колонки
    let newStatus = task.status;
    const colNameLower = column.name.toLowerCase();

    if (colNameLower.includes('done') || colNameLower.includes('выполн')) {
      newStatus = TaskStatus.DONE;
    } else if (
      colNameLower.includes('progress') ||
      colNameLower.includes('работ') ||
      colNameLower.includes('процесс')
    ) {
      newStatus = TaskStatus.IN_PROGRESS;
    } else if (
      colNameLower.includes('review') ||
      colNameLower.includes('провер')
    ) {
      newStatus = TaskStatus.REVIEW;
    } else if (
      colNameLower.includes('todo') ||
      colNameLower.includes('сделать')
    ) {
      newStatus = TaskStatus.TODO;
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        kanbanColumnId: dto.columnId,
        status: newStatus,
        completedAt: newStatus === TaskStatus.DONE ? new Date() : null,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        checkpoints: { orderBy: { order: 'asc' } },
        category: true,
      },
    });
  }

  async removeTaskFromBoard(userId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        kanbanColumn: { include: { board: true } },
      },
    });

    if (!task || !task.kanbanColumn) {
      throw new NotFoundException('Задача не найдена на доске');
    }

    await this.checkProjectAccess(userId, task.kanbanColumn.board.projectId, [
      'MANAGER',
      'MEMBER',
    ]);

    return this.prisma.task.update({
      where: { id: taskId },
      data: { kanbanColumnId: null },
    });
  }

  async getBoardStats(userId: string, boardId: string) {
    const board = await this.getBoardById(userId, boardId);

    const stats = board.columns.map((column) => ({
      columnId: column.id,
      columnName: column.name,
      taskCount: column.tasks.length,
      wipLimit: column.wipLimit,
      isAtLimit:
        column.wipLimit !== null && column.tasks.length >= column.wipLimit,
      completedCount: column.tasks.filter((t) => t.status === TaskStatus.DONE)
        .length,
    }));

    const totalTasks = board.columns.reduce(
      (sum, col) => sum + col.tasks.length,
      0,
    );
    const doneTasks = board.columns.reduce(
      (sum, col) =>
        sum + col.tasks.filter((t) => t.status === TaskStatus.DONE).length,
      0,
    );

    return {
      boardId: board.id,
      boardName: board.name,
      totalTasks,
      doneTasks,
      completionRate:
        totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
      columns: stats,
    };
  }

  private async checkProjectAccess(
    userId: string,
    projectId: string,
    allowedRoles: string[],
  ) {
    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: { userId, projectId },
      },
    });

    if (!member) {
      throw new ForbiddenException('Вы не являетесь участником проекта');
    }

    if (!allowedRoles.includes(member.role)) {
      throw new ForbiddenException(
        `Требуется роль: ${allowedRoles.join(' или ')}`,
      );
    }

    return member;
  }
}
