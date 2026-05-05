import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';

import { MoodsService } from '@modules/moods/moods.service';
import { GetUserId } from '@common/decorators/get-user.decorator';
import { SetMoodDto } from '@modules/moods/dtos/set-mood.dto';

@Controller('moods')
export class MoodsController {
  constructor(private readonly moodsService: MoodsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async setTodayMood(@GetUserId() userId: string, @Body() dto: SetMoodDto) {
    return this.moodsService.setTodayMood(userId, dto);
  }

  @Get('today')
  async getTodayMood(@GetUserId() userId: string) {
    return this.moodsService.getTodayMood(userId);
  }

  @Get('history')
  async getHistory(
    @GetUserId() userId: string,
    @Query('days') days: string = '90',
  ) {
    const daysNum = Math.min(Math.max(parseInt(days) || 90, 1), 365);
    return this.moodsService.getMoodHistory(userId, daysNum);
  }

  @Get('stats')
  async getStats(
    @GetUserId() userId: string,
    @Query('days') days: string = '30',
  ) {
    const daysNum = Math.min(Math.max(parseInt(days) || 30, 1), 365);
    return this.moodsService.getMoodStats(userId, daysNum);
  }

  @Get('heatmap')
  async getHeatmap(
    @GetUserId() userId: string,
    @Query('days') days: string = '90',
  ) {
    const daysNum = Math.min(Math.max(parseInt(days) || 90, 1), 365);
    return this.moodsService.getHeatmap(userId, daysNum);
  }

  @Get('streak')
  async getStreak(@GetUserId() userId: string) {
    const streak = await this.moodsService.getMoodStreak(userId);
    return { streak };
  }
}
