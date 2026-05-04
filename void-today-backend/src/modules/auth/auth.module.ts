import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '@core/prisma/prisma.module';
import { AuthService } from '@modules/auth/auth.service';
import { AuthController } from '@modules/auth/auth.controller';
import { EnvModule } from '@core/env/env.module';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';
import { RefreshStrategy } from '@modules/auth/strategies/refresh.strategy';

@Module({
  imports: [PrismaModule, JwtModule.register({}), EnvModule],
  providers: [AuthService, JwtStrategy, RefreshStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
