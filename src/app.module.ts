import { Module } from '@nestjs/common';
import { RavenService } from './services/raven/raven.service';
import { ApiController } from './controllers/api/api.controller';
import { ImageRepository } from './services/image/image.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ImageEditorService } from './services/image-editor/image-editor.service';
import { UserController } from './controllers/user/user.controller';
import { UserRepository } from './services/user/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './services/auth/auth.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule.forRoot({})],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  controllers: [UserController, ApiController],
  providers: [
    RavenService,
    ImageRepository,
    ImageEditorService,
    UserRepository,
    JwtStrategy,
    AuthService,
  ],
})
export class AppModule {}
