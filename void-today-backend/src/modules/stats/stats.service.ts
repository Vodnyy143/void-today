import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { TaskStatus } from '@generated/prisma/enums';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasksToday = await this.prisma.task.count({
      where: {
        creatorId: userId,
        dueDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const doneToday = await this.prisma.task.count({
      where: {
        creatorId: userId,
        status: TaskStatus.DONE,
        completedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const streak = await this.getMoodStreak(userId);

    const heatmap = await this.getHeatmap(userId, 90);

    const goals = await this.prisma.goal.findMany({
      where: { userId },
      include: { tasks: true },
      take: 5,
    });

    const goalsWithProgress = goals.map((goal) => ({
      ...goal,
      progress: this.calculateProgress(goal.tasks),
    }));

    const todayMood = await this.prisma.mood.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    return {
      tasksToday,
      doneToday,
      completionRate:
        tasksToday > 0 ? Math.round((doneToday / tasksToday) * 100) : 0,
      streak,
      heatmap,
      goals: goalsWithProgress,
      mood: todayMood,
    };
  }

  async getWeeklyStats(userId: string) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Начало недели (воскресенье)
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const tasks = await this.prisma.task.findMany({
      where: {
        creatorId: userId,
        createdAt: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
      },
    });

    const dailyStats = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      day.setHours(0, 0, 0, 0);

      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const dayTasks = tasks.filter(
        (t) => t.completedAt && t.completedAt >= day && t.completedAt < nextDay,
      );

      return {
        date: day.toISOString().split('T')[0],
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()],
        completed: dayTasks.length,
        total: tasks.filter((t) => t.createdAt >= day && t.createdAt < nextDay)
          .length,
      };
    });

    const totalCompleted = tasks.filter(
      (t) => t.status === TaskStatus.DONE,
    ).length;
    const totalTasks = tasks.length;

    return {
      weekStart: startOfWeek.toISOString().split('T')[0],
      weekEnd: endOfWeek.toISOString().split('T')[0],
      totalCompleted,
      totalTasks,
      completionRate:
        totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0,
      dailyStats,
    };
  }

  async getHeatmap(userId: string, days: number = 90) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const tasks = await this.prisma.task.findMany({
      where: {
        creatorId: userId,
        completedAt: {
          gte: startDate,
        },
      },
    });

    const heatmapMap = new Map<string, number>();

    tasks.forEach((task) => {
      if (task.completedAt) {
        const dateStr = task.completedAt.toISOString().split('T')[0];
        heatmapMap.set(dateStr, (heatmapMap.get(dateStr) || 0) + 1);
      }
    });

    const heatmap = Array.from(heatmapMap).map(([date, count]) => ({
      date,
      count,
    }));

    return heatmap.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }

  async getGraveyard(userId: string) {
    const now = new Date();

    const archived = await this.prisma.task.findMany({
      where: {
        creatorId: userId,
        status: TaskStatus.ARCHIVED,
      },
      include: {
        category: true,
        goal: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    const overdue = await this.prisma.task.findMany({
      where: {
        creatorId: userId,
        dueDate: {
          lt: now,
        },
        status: {
          notIn: [TaskStatus.DONE, TaskStatus.ARCHIVED],
        },
      },
      include: {
        category: true,
        goal: true,
      },
      orderBy: { dueDate: 'asc' },
      take: 50,
    });

    return {
      archived: archived.map((t) => ({
        ...t,
        type: 'archived',
      })),
      overdue: overdue.map((t) => ({
        ...t,
        type: 'overdue',
        daysOverdue: Math.floor(
          (now.getTime() - (t.dueDate?.getTime() || 0)) / (1000 * 60 * 60 * 24),
        ),
      })),
      totalArchived: archived.length,
      totalOverdue: overdue.length,
    };
  }

  async getCategoryStats(userId: string) {
    const categories = await this.prisma.category.findMany({
      where: { userId },
      include: {
        tasks: {
          where: { creatorId: userId },
        },
      },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      totalTasks: cat.tasks.length,
      completedTasks: cat.tasks.filter((t) => t.status === TaskStatus.DONE)
        .length,
      completionRate:
        cat.tasks.length > 0
          ? Math.round(
              (cat.tasks.filter((t) => t.status === TaskStatus.DONE).length /
                cat.tasks.length) *
                100,
            )
          : 0,
    }));
  }

  async getGoalStats(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      include: {
        tasks: true,
      },
    });

    return goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      level: goal.level,
      progress: this.calculateProgress(goal.tasks),
      totalTasks: goal.tasks.length,
      completedTasks: goal.tasks.filter((t) => t.status === TaskStatus.DONE)
        .length,
    }));
  }

  async getProductivityTrend(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const tasks = await this.prisma.task.findMany({
      where: {
        creatorId: userId,
        completedAt: {
          gte: startDate,
        },
      },
      orderBy: { completedAt: 'asc' },
    });

    const weeklyData = new Map<string, number>();

    tasks.forEach((task) => {
      if (task.completedAt) {
        const weekStart = new Date(task.completedAt);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekKey = weekStart.toISOString().split('T')[0];

        weeklyData.set(weekKey, (weeklyData.get(weekKey) || 0) + 1);
      }
    });

    const trend = Array.from(weeklyData)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([week, count]) => ({
        week,
        tasksCompleted: count,
      }));

    const averagePerWeek =
      trend.length > 0
        ? Math.round(
            trend.reduce((sum, w) => sum + w.tasksCompleted, 0) / trend.length,
          )
        : 0;

    return {
      period: `last ${days} days`,
      trend,
      averagePerWeek,
      totalCompleted: tasks.length,
    };
  }

  private calculateProgress(tasks: any[]): number {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === TaskStatus.DONE).length;
    return Math.round((completed / tasks.length) * 100);
  }

  private async getMoodStreak(userId: string): Promise<number> {
    const moods = await this.prisma.mood.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
    });

    if (moods.length === 0) return 0;

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < moods.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      const moodDate = new Date(moods[i].date);
      moodDate.setHours(0, 0, 0, 0);

      if (moodDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}
