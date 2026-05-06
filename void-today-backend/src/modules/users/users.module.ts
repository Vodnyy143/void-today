import { Module } from '@nestjs/common';

import { PrismaModule } from '@core/prisma/prisma.module';
import { UsersService } from '@modules/users/users.service';
import { UsersController } from '@modules/users/users.controller';

@Module({
  imports: [PrismaModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
