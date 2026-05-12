import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { PrismaService } from '@core/prisma/prisma.service';
import { EnvService } from '@core/env/env.service';
import { SignUpDto } from '@modules/auth/dtos/sign-up.dto';
import { SignInDto } from '@modules/auth/dtos/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly env: EnvService,
  ) {}

  async signUp(dto: SignUpDto, userAgent: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        subscription: {
          create: {
            plan: 'FREE',
          },
        },
      },
    });

    const tokens = await this.generateTokens(user.id, userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      ...tokens,
    };
  }

  async signIn(dto: SignInDto, userAgent: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await argon2.verify(user.password, dto.password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string, userAgent: string) {
    const tokenRecord = await this.prisma.token.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenRecord || tokenRecord.userId !== userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.token.delete({
      where: { id: tokenRecord.id },
    });

    const tokens = await this.generateTokens(userId, userAgent);

    return tokens;
  }

  async signOut(userId: string, userAgent: string) {
    await this.prisma.token.deleteMany({
      where: {
        userId,
        userAgent,
      },
    });

    return { success: true };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async generateTokens(userId: string, userAgent: string) {
    const accessToken = this.jwt.sign({ sub: userId }, {
      secret: this.env.get('ACCESS_SECRET'),
      expiresIn: `${this.env.get('ACCESS_EXP')}m`,
    } as JwtSignOptions);

    const refreshTokenString = this.jwt.sign({ sub: userId }, {
      secret: this.env.get('REFRESH_SECRET'),
      expiresIn: `${this.env.get('REFRESH_EXP')}d`,
    } as JwtSignOptions);

    const hashedRefreshToken = await argon2.hash(refreshTokenString);

    await this.prisma.token.upsert({
      where: {
        userId_userAgent: {
          userId,
          userAgent,
        },
      },
      update: {
        token: hashedRefreshToken,
      },
      create: {
        token: hashedRefreshToken,
        userId,
        userAgent,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
    };
  }
}
