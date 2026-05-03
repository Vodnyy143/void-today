import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { PrismaService } from '@core/prisma/prisma.service';
import { EnvService } from '@core/env/env.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly env: EnvService,
  ) {}

  async signUp() {}

  async signIn() {}

  async refreshTokens() {}

  async signOut() {}

  async getMe() {}

  private async generateTokens() {}
}
