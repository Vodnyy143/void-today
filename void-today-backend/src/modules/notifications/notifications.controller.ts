import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from '@modules/notifications/notifications.service';
import { JwtGuard } from '@modules/auth/guards/jwt.guard';
import { GetUserId } from '@common/decorators/get-user.decorator';
import { GetNotificationsQueryDto } from '@modules/notifications/dtos/get-notifications.dto';
import { MarkReadDto } from '@modules/notifications/dtos/mark-read.dto';

@Controller('notifications')
@UseGuards(JwtGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @GetUserId() userId: string,
    @Query() query: GetNotificationsQueryDto,
  ) {
    return this.notificationsService.findAll(userId, query);
  }

  @Get('unread-count')
  getUnreadCount(@GetUserId() userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch('read')
  @HttpCode(HttpStatus.OK)
  markRead(@GetUserId() userId: string, @Body() dto: MarkReadDto) {
    return this.notificationsService.markRead(userId, dto);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  markAllRead(@GetUserId() userId: string) {
    return this.notificationsService.markAllRead(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteOne(@GetUserId() userId: string, @Param('id') id: string) {
    return this.notificationsService.deleteOne(userId, id);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  deleteAll(@GetUserId() userId: string) {
    return this.notificationsService.deleteAll(userId);
  }
}
