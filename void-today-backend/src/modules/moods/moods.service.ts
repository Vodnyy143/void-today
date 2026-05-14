import { Injectable } from '@nestjs/common';

import { PrismaService } from '@core/prisma/prisma.service';
import { MoodType } from '@generated/prisma/enums';
import { SetMoodDto } from '@modules/moods/dtos/set-mood.dto';

@Injectable()
export class MoodsService {
  constructor(private readonly prisma: PrismaService) {}

  async setTodayMood(userId: string, dto: SetMoodDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingMood = await this.prisma.mood.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingMood) {
      return this.prisma.mood.update({
        where: { id: existingMood.id },
        data: {
          value: dto.value,
        },
      });
    }

    return this.prisma.mood.create({
      data: {
        value: dto.value,
        userId,
      },
    });
  }

  async getTodayMood(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.mood.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
  }

  async getMoodHistory(userId: string, days: number = 90) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return this.prisma.mood.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async getMoodStats(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const moods = await this.prisma.mood.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    const moodCounts = {
      [MoodType.DEAD]: 0,
      [MoodType.OK]: 0,
      [MoodType.ANGRY]: 0,
      [MoodType.FIRE]: 0,
      [MoodType.CHAOS]: 0,
    };

    moods.forEach((mood) => {
      moodCounts[mood.value]++;
    });

    let dominantMood: MoodType = MoodType.OK;
    let maxCount = 0;
    for (const [mood, count] of Object.entries(moodCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantMood = mood as MoodType;
      }
    }

    const totalDays = moods.length;
    const averageMoodScore = this.calculateAverageMoodScore(moods);

    return {
      totalDays,
      averageMoodScore,
      dominantMood,
      moodCounts,
      trend: this.calculateMoodTrend(moods),
      lastMood: moods.length > 0 ? moods[moods.length - 1] : null,
    };
  }

  async getHeatmap(userId: string, days: number = 90) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const moods = await this.prisma.mood.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Группируем по датам
    const heatmapData = new Map<string, MoodType>();

    moods.forEach((mood) => {
      const dateStr = mood.date.toISOString().split('T')[0];
      heatmapData.set(dateStr, mood.value);
    });

    // Преобразуем в массив
    const result = Array.from(heatmapData).map(([date, mood]) => ({
      date,
      mood,
      score: this.getMoodScore(mood),
    }));

    return result;
  }

  private getMoodScore(mood: MoodType): number {
    const scores = {
      [MoodType.DEAD]: 1,
      [MoodType.OK]: 2,
      [MoodType.CHAOS]: 3,
      [MoodType.ANGRY]: 2,
      [MoodType.FIRE]: 5,
    };
    return scores[mood] || 2;
  }

  private calculateAverageMoodScore(moods: any[]): number {
    if (moods.length === 0) return 0;
    const totalScore = moods.reduce(
      (sum, mood) => sum + this.getMoodScore(mood.value),
      0,
    );
    return Math.round((totalScore / moods.length) * 10) / 10;
  }

  private calculateMoodTrend(moods: any[]): string {
    if (moods.length < 2) return 'neutral';

    const recentMoods = moods.slice(-7);
    const oldMoods = moods.slice(-14, -7);

    if (oldMoods.length === 0) return 'neutral';

    const recentScore = this.calculateAverageMoodScore(recentMoods);
    const oldScore = this.calculateAverageMoodScore(oldMoods);

    if (recentScore > oldScore + 0.5) return 'improving';
    if (recentScore < oldScore - 0.5) return 'declining';
    return 'stable';
  }

  async getMoodStreak(userId: string): Promise<number> {
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
