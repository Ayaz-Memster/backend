import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, StrategyOptions } from 'passport-jwt';
import { UnauthorizedError } from './errors/UnauthorizedError';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: (request: Request) => {
        let data = request?.cookies?.['access_token'];
        if (!data) {
          return null;
        }
        return data;
      },
    } as StrategyOptions);
  }

  async validate(payload: any) {
    if (payload === null) {
      throw new UnauthorizedError('Payload not found');
    }
    return payload;
  }
}
