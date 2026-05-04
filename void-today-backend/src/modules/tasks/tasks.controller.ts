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

import { TasksService } from '@modules/tasks/tasks.service';
import { GetUserId } from '@common/decorators/get-user.decorator';
import { JwtGuard } from '@modules/auth/guards/jwt.guard';
import { CreateTaskDto } from '@modules/tasks/dtos/create-task.dto';
import { GetTasksQueryDto } from '@modules/tasks/dtos/get-tasks-query.dto';
import { UpdateTaskDto } from '@modules/tasks/dtos/update-task.dto';

@Controller('tasks')
@UseGuards(JwtGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@GetUserId() userId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(userId, dto);
  }

  @Get()
  async findAll(@GetUserId() userId: string, @Query() query: GetTasksQueryDto) {
    return this.tasksService.findAll(userId, query);
  }

  @Get('chaos')
  async getChaos(@GetUserId() userId: string) {
    return this.tasksService.getChaos(userId);
  }

  @Get(':id')
  async findOne(@Param('id') taskId: string, @GetUserId() userId: string) {
    return this.tasksService.findOne(taskId, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') taskId: string,
    @GetUserId() userId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(taskId, userId, dto);
  }

  @Patch(':id/checkpoints/:cpId')
  async toggleCheckpoint(
    @Param('id') taskId: string,
    @Param('cpId') cpId: string,
    @GetUserId() userId: string,
  ) {
    return this.tasksService.toggleCheckpoint(taskId, cpId, userId);
  }

  @Delete(':id')
  async delete(@Param('id') taskId: string, @GetUserId() userId: string) {
    return this.tasksService.delete(taskId, userId);
  }
}
