import { Controller, Get, Query } from '@nestjs/common';
import { StatsService } from '@modules/stats/stats.service';
import { GetUserId } from '@common/decorators/get-user.decorator';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  async getDashboard(@GetUserId() userId: string) {
    return this.statsService.getDashboard(userId);
  }

  @Get('weekly')
  async getWeekly(@GetUserId() userId: string) {
    return this.statsService.getWeeklyStats(userId);
  }

  @Get('heatmap')
  async getHeatmap(
    @GetUserId() userId: string,
    @Query('days') days: string = '90',
  ) {
    const daysNum = Math.min(Math.max(parseInt(days) || 90, 1), 365);
    return this.statsService.getHeatmap(userId, daysNum);
  }

  @Get('graveyard')
  async getGraveyard(@GetUserId() userId: string) {
    return this.statsService.getGraveyard(userId);
  }

  @Get('categories')
  async getCategoryStats(@GetUserId() userId: string) {
    return this.statsService.getCategoryStats(userId);
  }

  @Get('goals')
  async getGoalStats(@GetUserId() userId: string) {
    return this.statsService.getGoalStats(userId);
  }

  @Get('productivity')
  async getProductivityTrend(
    @GetUserId() userId: string,
    @Query('days') days: string = '30',
  ) {
    const daysNum = Math.min(Math.max(parseInt(days) || 30, 1), 365);
    return this.statsService.getProductivityTrend(userId, daysNum);
  }
}
