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
  UseGuards,
} from '@nestjs/common';
import { KanbanService } from '@modules/kanban/kanban.service';
import { GetUserId } from '@common/decorators/get-user.decorator';
import { CreateBoardDto } from '@modules/kanban/dtos/create-board.dto';
import { UpdateBoardDto } from '@modules/kanban/dtos/update-board.dto';
import { CreateColumnDto } from '@modules/kanban/dtos/create-column.dto';
import { UpdateColumnDto } from '@modules/kanban/dtos/update-column.dto';
import { ReorderColumnsDto } from '@modules/kanban/dtos/reorder-column.dto';
import { MoveTaskDto } from '@modules/kanban/dtos/move-task.dto';
import { JwtGuard } from '@modules/auth/guards/jwt.guard';

@Controller('kanban')
@UseGuards(JwtGuard)
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) {}

  @Post('boards')
  @HttpCode(HttpStatus.CREATED)
  createBoard(@GetUserId() userId: string, @Body() dto: CreateBoardDto) {
    return this.kanbanService.createBoard(userId, dto);
  }

  @Get('boards/project/:projectId')
  getBoardsByProject(
    @GetUserId() userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.kanbanService.getBoardsByProject(userId, projectId);
  }

  @Get('boards/:boardId')
  getBoardById(@GetUserId() userId: string, @Param('boardId') boardId: string) {
    return this.kanbanService.getBoardById(userId, boardId);
  }

  @Get('boards/:boardId/stats')
  getBoardStats(
    @GetUserId() userId: string,
    @Param('boardId') boardId: string,
  ) {
    return this.kanbanService.getBoardStats(userId, boardId);
  }

  @Patch('boards/:boardId')
  updateBoard(
    @GetUserId() userId: string,
    @Param('boardId') boardId: string,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.kanbanService.updateBoard(userId, boardId, dto);
  }

  @Delete('boards/:boardId')
  @HttpCode(HttpStatus.OK)
  deleteBoard(@GetUserId() userId: string, @Param('boardId') boardId: string) {
    return this.kanbanService.deleteBoard(userId, boardId);
  }

  // ─── Columns ─────────────────────────────────────────────────────────────────

  @Post('boards/:boardId/columns')
  @HttpCode(HttpStatus.CREATED)
  createColumn(
    @GetUserId() userId: string,
    @Param('boardId') boardId: string,
    @Body() dto: CreateColumnDto,
  ) {
    return this.kanbanService.createColumn(userId, boardId, dto);
  }

  @Patch('columns/:columnId')
  updateColumn(
    @GetUserId() userId: string,
    @Param('columnId') columnId: string,
    @Body() dto: UpdateColumnDto,
  ) {
    return this.kanbanService.updateColumn(userId, columnId, dto);
  }

  @Delete('columns/:columnId')
  @HttpCode(HttpStatus.OK)
  deleteColumn(
    @GetUserId() userId: string,
    @Param('columnId') columnId: string,
  ) {
    return this.kanbanService.deleteColumn(userId, columnId);
  }

  @Patch('boards/:boardId/columns/reorder')
  reorderColumns(
    @GetUserId() userId: string,
    @Param('boardId') boardId: string,
    @Body() dto: ReorderColumnsDto,
  ) {
    return this.kanbanService.reorderColumns(userId, boardId, dto);
  }

  // ─── Tasks ───────────────────────────────────────────────────────────────────

  @Patch('tasks/:taskId/move')
  moveTask(
    @GetUserId() userId: string,
    @Param('taskId') taskId: string,
    @Body() dto: MoveTaskDto,
  ) {
    return this.kanbanService.moveTask(userId, taskId, dto);
  }

  @Delete('tasks/:taskId/remove')
  @HttpCode(HttpStatus.OK)
  removeTaskFromBoard(
    @GetUserId() userId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.kanbanService.removeTaskFromBoard(userId, taskId);
  }
}
