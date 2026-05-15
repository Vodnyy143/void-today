import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { NotificationType } from '@generated/prisma/enums';
import { GetNotificationsQueryDto } from '@modules/notifications/dtos/get-notifications.dto';
import { MarkReadDto } from '@modules/notifications/dtos/mark-read.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: GetNotificationsQueryDto) {
    const where: any = { userId };

    if (query.unreadOnly) {
      where.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId, read: false },
      }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      hasMore: query.offset + query.limit < total,
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });
    return { count };
  }

  // ─── Управление статусом прочтения ───────────────────────────────────────────

  async markRead(userId: string, dto: MarkReadDto) {
    await this.prisma.notification.updateMany({
      where: {
        id: { in: dto.ids },
        userId, // защита: только свои уведомления
      },
      data: { read: true },
    });

    return this.getUnreadCount(userId);
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { count: 0 };
  }

  async deleteOne(userId: string, notificationId: string) {
    await this.prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
    return { success: true };
  }

  async deleteAll(userId: string) {
    await this.prisma.notification.deleteMany({ where: { userId } });
    return { success: true };
  }

  // ─── Создание уведомлений (вызывается из других сервисов) ────────────────────

  async create(userId: string, type: NotificationType, text: string) {
    return this.prisma.notification.create({
      data: { userId, type, text, read: false },
    });
  }

  async createMany(userIds: string[], type: NotificationType, text: string) {
    return this.prisma.notification.createMany({
      data: userIds.map((userId) => ({ userId, type, text, read: false })),
    });
  }

  // ─── Хелперы для типовых уведомлений ────────────────────────────────────────

  async notifyTaskAssigned(
    assigneeId: string,
    taskTitle: string,
    assignerName: string,
  ) {
    return this.create(
      assigneeId,
      NotificationType.TASK_ASSIGNED,
      `${assignerName} назначил вам задачу "${taskTitle}"`,
    );
  }

  async notifyTaskDue(userId: string, taskTitle: string, hoursLeft: number) {
    const timeStr =
      hoursLeft <= 1 ? 'через менее чем час' : `через ${hoursLeft} ч.`;

    return this.create(
      userId,
      NotificationType.TASK_DUE,
      `Задача "${taskTitle}" истекает ${timeStr}`,
    );
  }

  async notifyTaskDone(creatorId: string, taskTitle: string, doerName: string) {
    return this.create(
      creatorId,
      NotificationType.TASK_DONE,
      `${doerName} выполнил задачу "${taskTitle}"`,
    );
  }

  async notifySprintStart(
    memberIds: string[],
    sprintName: string,
    projectName: string,
  ) {
    return this.createMany(
      memberIds,
      NotificationType.SPRINT_START,
      `Спринт "${sprintName}" в проекте "${projectName}" запущен`,
    );
  }

  async notifySprintEnd(
    memberIds: string[],
    sprintName: string,
    completionRate: number,
  ) {
    return this.createMany(
      memberIds,
      NotificationType.SPRINT_END,
      `Спринт "${sprintName}" завершён. Выполнено ${completionRate}% задач`,
    );
  }

  async notifyInvite(userId: string, orgName: string, inviterName: string) {
    return this.create(
      userId,
      NotificationType.INVITE,
      `${inviterName} пригласил вас в организацию "${orgName}"`,
    );
  }

  async notifyMention(
    userId: string,
    mentionerName: string,
    taskTitle: string,
  ) {
    return this.create(
      userId,
      NotificationType.MENITION,
      `${mentionerName} упомянул вас в задаче "${taskTitle}"`,
    );
  }
}
