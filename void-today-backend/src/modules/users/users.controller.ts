import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Query,
} from '@nestjs/common';

import { UsersService } from '@modules/users/users.service';
import { GetUserId } from '@common/decorators/get-user.decorator';
import { UpdateProfileDto } from '@modules/users/dtos/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@GetUserId() userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Get('search')
  async searchUsers(
    @Query('q') query: string,
    @Query('limit') limit: string = '10',
  ) {
    const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 50);
    return this.usersService.searchUsers(query, limitNum);
  }

  @Get('stats')
  async getStats(@GetUserId() userId: string) {
    return this.usersService.getUserStats(userId);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @GetUserId() userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }
}
