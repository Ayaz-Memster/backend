import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDto, UserPayload } from '../../contract/user';
import { InvalidArgumentError } from '../../errors/InvalidArgumentError';
import { AuthService } from '../../services/auth/auth.service';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  @Post('register')
  async register(
    @Body('username') username?: string,
    @Body('password') password?: string
  ): Promise<void> {
    if (!username) {
      throw new InvalidArgumentError('Username is not provided');
    }
    if (!password) {
      throw new InvalidArgumentError('Password is not provided');
    }
    await this.authService.register(username, password);
  }

  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body('username') username?: string,
    @Body('password') password?: string
  ): Promise<void> {
    if (!username) {
      throw new InvalidArgumentError('Username is not provided');
    }
    if (!password) {
      throw new InvalidArgumentError('Password is not provided');
    }
    await this.authService.authenticate(username, password);

    const userPayload: UserPayload = {
      username: username,
    };
    const token = this.jwtService.sign(userPayload, {
      expiresIn: '7d',
    });
    res.cookie('access_token', token, { httpOnly: true, maxAge: 604800000 });
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie('access_token');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getUser(@Req() req: Request): Promise<UserDto> {
    const payload = req.user as UserPayload;
    if (!payload?.username) {
      throw new InvalidArgumentError('Cannot get username from payload');
    }
    return this.authService.getUser(payload.username);
  }
}
