import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@core/prisma/prisma.service';
import { UpdateProfileDto } from '@modules/users/dtos/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        subscription: {
          select: {
            plan: true,
            expiresAt: true,
          },
        },
        _count: {
          select: {
            createdTasks: true,
            goals: true,
            notes: true,
            moods: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    return user || null;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        avatar: dto.avatar,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async searchUsers(query: string, limit: number = 10) {
    // Ищем по email или name
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
      take: limit,
    });

    return users;
  }

  async getUserStats(userId: string) {
    const user = await this.getProfile(userId);

    const tasks = await this.prisma.task.findMany({
      where: { creatorId: userId },
    });

    const completedTasks = tasks.filter((t) => t.status === 'DONE').length;

    const projects = await this.prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });

    const assignedTasks = await this.prisma.task.findMany({
      where: { assigneeId: userId },
    });

    const completedAssignedTasks = assignedTasks.filter(
      (t) => t.status === 'DONE',
    ).length;

    return {
      userId,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      subscription: user.subscription,
      stats: {
        createdTasks: tasks.length,
        completedTasks,
        completionRate:
          tasks.length > 0
            ? Math.round((completedTasks / tasks.length) * 100)
            : 0,
        goals: user._count.goals,
        notes: user._count.notes,
        projectCount: projects.length,
        assignedTasks: assignedTasks.length,
        completedAssignedTasks,
        assignedCompletionRate:
          assignedTasks.length > 0
            ? Math.round((completedAssignedTasks / assignedTasks.length) * 100)
            : 0,
      },
      createdAt: user.createdAt,
      joinedDaysAgo: Math.floor(
        (new Date().getTime() - user.createdAt.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    };
  }
}
