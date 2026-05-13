import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService } from '@modules/auth/auth.service';
import { SignUpDto } from '@modules/auth/dtos/sign-up.dto';
import { SignInDto } from '@modules/auth/dtos/sign-in.dto';
import { JwtGuard } from '@modules/auth/guards/jwt.guard';
import { GetUserId } from '@common/decorators/get-user.decorator';
import { RefreshGuard } from '@modules/auth/guards/refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body() dto: SignUpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.get('user-agent') || 'unknown';
    const result = await this.authService.signUp(dto, userAgent);

    this.setCookies(res, result.accessToken, result.refreshToken);

    return {
      user: result.user,
    };
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() dto: SignInDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.get('user-agent') || 'unknown';
    const result = await this.authService.signIn(dto, userAgent);

    this.setCookies(res, result.accessToken, result.refreshToken);

    return {
      user: result.user,
    };
  }

  @Get('me')
  @UseGuards(JwtGuard)
  async getMe(@GetUserId() userId: string) {
    return this.authService.getMe(userId);
  }

  @Post('refresh')
  @UseGuards(RefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @GetUserId() userId: string,
    @Req() req: Request & { refreshToken?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log(userId);
    const userAgent = req.get('user-agent') || 'unknown';
    const refreshToken = req.refreshToken!;

    const tokens = await this.authService.refreshTokens(
      userId,
      refreshToken,
      userAgent,
    );

    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    return { success: true };
  }

  @Post('sign-out')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async signOut(
    @GetUserId() userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.get('user-agent') || 'unknown';

    await this.authService.signOut(userId, userAgent);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { success: true };
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
}
