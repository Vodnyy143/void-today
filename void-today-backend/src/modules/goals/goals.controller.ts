import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GoalsService } from '@modules/goals/goals.service';
import { GetUserId } from '@common/decorators/get-user.decorator';
import { CreateGoalDto } from '@modules/goals/dtos/create-goal.dto';
import { GetGoalsQueryDto } from '@modules/goals/dtos/get-goals-query.dto';
import { UpdateGoalDto } from '@modules/goals/dtos/update-goal.dto';
import { JwtGuard } from '@modules/auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@GetUserId() userId: string, @Body() dto: CreateGoalDto) {
    return this.goalsService.create(userId, dto);
  }

  @Get()
  async findAll(@GetUserId() userId: string, @Query() query: GetGoalsQueryDto) {
    return this.goalsService.findAll(userId, query);
  }

  @Get('hierarchy')
  async getHierarchy(@GetUserId() userId: string) {
    return this.goalsService.getGoalHierarchy(userId);
  }

  @Get(':id')
  async findOne(@Param('id') goalId: string, @GetUserId() userId: string) {
    return this.goalsService.findOne(goalId, userId);
  }

  @Get(':id/stats')
  async getStats(@Param('id') goalId: string, @GetUserId() userId: string) {
    return this.goalsService.getGoalStats(goalId, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') goalId: string,
    @GetUserId() userId: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalsService.update(goalId, userId, dto);
  }

  @Post(':id/tasks/:taskId')
  @HttpCode(HttpStatus.OK)
  async linkTask(
    @Param('id') goalId: string,
    @Param('taskId') taskId: string,
    @GetUserId() userId: string,
  ) {
    return this.goalsService.linkTask(goalId, taskId, userId);
  }

  @Delete(':id/tasks/:taskId')
  async unlinkTask(
    @Param('id') goalId: string,
    @Param('taskId') taskId: string,
    @GetUserId() userId: string,
  ) {
    return this.goalsService.unlinkTask(goalId, taskId, userId);
  }

  @Delete(':id')
  async delete(@Param('id') goalId: string, @GetUserId() userId: string) {
    return this.goalsService.delete(goalId, userId);
  }
}
