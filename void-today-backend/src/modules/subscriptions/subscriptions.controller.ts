import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';
import { GetUserId } from '@common/decorators/get-user.decorator';
import { UpgradeSubscriptionDto } from '@modules/subscriptions/dtos/upgrade-subscription.dto';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('me')
  async getMySubscription(@GetUserId() userId: string) {
    return this.subscriptionsService.getSubscription(userId);
  }

  @Patch('upgrade')
  @HttpCode(HttpStatus.OK)
  async upgrade(
    @GetUserId() userId: string,
    @Body() dto: UpgradeSubscriptionDto,
  ) {
    return this.subscriptionsService.upgrade(userId, dto);
  }

  @Delete('downgrade')
  @HttpCode(HttpStatus.OK)
  async downgrade(@GetUserId() userId: string) {
    return this.subscriptionsService.downgrade(userId);
  }
}
