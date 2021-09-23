import { Module } from '@nestjs/common';
import { RavenService } from './raven/raven.service';
import { ApiController } from './api/api.controller';
import { ImageRepository } from './image/image.repository';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ImageEditorService } from './image-editor/image-editor.service';

@Module({
  imports: [ConfigModule.forRoot({}), HttpModule],
  controllers: [ApiController],
  providers: [RavenService, ImageRepository, ImageEditorService],
})
export class AppModule {}
