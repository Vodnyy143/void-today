import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { EnvService } from '@core/env/env.service';

interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private readonly env: EnvService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          return req?.cookies?.refreshToken;
        },
      ]),
      secretOrKey: env.get('REFRESH_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  validate(req: any, payload: JwtPayload) {
    const refreshToken = req?.cookies?.refreshToken;
    return {
      userId: payload.sub,
      refreshToken,
    };
  }
}
