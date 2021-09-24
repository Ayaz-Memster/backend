import { Module } from '@nestjs/common';
import { RavenService } from './services/raven/raven.service';
import { ApiController } from './controllers/api/api.controller';
import { ImageRepository } from './services/image/image.repository';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ImageEditorService } from './services/image-editor/image-editor.service';

@Module({
  imports: [ConfigModule.forRoot({}), HttpModule],
  controllers: [ApiController],
  providers: [RavenService, ImageRepository, ImageEditorService],
})
export class AppModule {}
