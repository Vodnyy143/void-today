import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
  StrategyOptionsWithoutRequest,
} from 'passport-jwt';
import { EnvService } from '@core/env/env.service';

interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly env: EnvService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          return req?.cookies.accessToken;
        },
      ]),
      secretOrKey: env.get('ACCESS_SECRET'),
      ignoreExpiration: false,
    } as StrategyOptionsWithoutRequest);
  }

  async validate(payload: JwtPayload) {
    return { userId: payload.sub };
  }
}
