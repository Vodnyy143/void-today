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
import { SprintsService } from '@modules/sprints/sprints.service';
import { GetUserId } from '@common/decorators/get-user.decorator';
import { CreateSprintDto } from '@modules/sprints/dtos/create-sprint.dto';
import { UpdateSprintDto } from '@modules/sprints/dtos/update-sprint.dto';
import { AddTasksToSprintDto } from '@modules/sprints/dtos/add-tasks.dto';
import { JwtGuard } from '@modules/auth/guards/jwt.guard';

@Controller('sprints')
@UseGuards(JwtGuard)
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@GetUserId() userId: string, @Body() dto: CreateSprintDto) {
    return this.sprintsService.create(userId, dto);
  }

  @Get()
  findAllByProject(
    @GetUserId() userId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.sprintsService.findAllByProject(userId, projectId);
  }

  @Get(':sprintId')
  findOne(@GetUserId() userId: string, @Param('sprintId') sprintId: string) {
    return this.sprintsService.findOne(userId, sprintId);
  }

  @Patch(':sprintId')
  update(
    @GetUserId() userId: string,
    @Param('sprintId') sprintId: string,
    @Body() dto: UpdateSprintDto,
  ) {
    return this.sprintsService.update(userId, sprintId, dto);
  }

  @Delete(':sprintId')
  @HttpCode(HttpStatus.OK)
  delete(@GetUserId() userId: string, @Param('sprintId') sprintId: string) {
    return this.sprintsService.delete(userId, sprintId);
  }

  // ─── Управление статусом ─────────────────────────────────────────────────────

  @Post(':sprintId/start')
  @HttpCode(HttpStatus.OK)
  start(@GetUserId() userId: string, @Param('sprintId') sprintId: string) {
    return this.sprintsService.start(userId, sprintId);
  }

  @Post(':sprintId/complete')
  @HttpCode(HttpStatus.OK)
  complete(@GetUserId() userId: string, @Param('sprintId') sprintId: string) {
    return this.sprintsService.complete(userId, sprintId);
  }

  // ─── Задачи ──────────────────────────────────────────────────────────────────

  @Post(':sprintId/tasks')
  @HttpCode(HttpStatus.OK)
  addTasks(
    @GetUserId() userId: string,
    @Param('sprintId') sprintId: string,
    @Body() dto: AddTasksToSprintDto,
  ) {
    return this.sprintsService.addTasks(userId, sprintId, dto);
  }

  @Delete(':sprintId/tasks/:taskId')
  @HttpCode(HttpStatus.OK)
  removeTask(
    @GetUserId() userId: string,
    @Param('sprintId') sprintId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.sprintsService.removeTask(userId, sprintId, taskId);
  }

  @Get('backlog/:projectId')
  getBacklog(
    @GetUserId() userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.sprintsService.getBacklog(userId, projectId);
  }

  @Get(':sprintId/stats')
  getStats(@GetUserId() userId: string, @Param('sprintId') sprintId: string) {
    return this.sprintsService.getStats(userId, sprintId);
  }
}
