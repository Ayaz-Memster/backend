import { HttpService } from '@nestjs/axios';
import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { AddImageDto, ImageDto } from 'src/contract/image';
import { ImageEditorService } from 'src/services/image-editor/image-editor.service';
import { ImageRepository } from 'src/services/image/image.repository';

@Controller('api')
export class ApiController {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly httpService: HttpService,
    private readonly imageEditor: ImageEditorService
  ) {}

  @Get('images')
  async getImages(
    @Query('search') search: string | undefined
  ): Promise<ImageDto[]> {
    return this.imageRepository.getImagesList(search);
  }

  @Get('image/:name')
  async getImageInfo(@Param('name') name: string): Promise<ImageDto> {
    return this.imageRepository.getImage(name);
  }

  @Get('download/:name')
  async downloadImage(
    @Param('name') name: string,
    @Res() response: Response
  ): Promise<void> {
    const isAnimated = await this.imageRepository.checkAnimation(name);

    if (isAnimated) {
      response.contentType('image/gif');
      const image = await this.imageRepository.getOriginalBuffer(name);
      response.send(image);
      return;
    }
    response.contentType('image/png');
    const image = await this.imageRepository.getImageBuffer(name);
    const png = await this.imageEditor.toPng(image);
    response.send(png);
  }

  @Get(':name')
  @Header('Content-Type', 'image/webp')
  async getImage(
    @Param('name') name: string,
    @Query('preview') isPreview?: 'true' | 'false'
  ): Promise<StreamableFile> {
    let image: Buffer;
    if (isPreview !== 'true') {
      image = await this.imageRepository.getImageBuffer(name);
    } else {
      image = await this.imageRepository.getPreviewBuffer(name);
    }
    return new StreamableFile(image);
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async addImage(
    @Body() addImageDto: AddImageDto,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<void> {
    let buffer: Buffer;
    let contentType: string;
    if (file) {
      buffer = file.buffer;
      contentType = file.mimetype;
    } else {
      if (!addImageDto.link) {
        throw new Error('Link is not provided');
      }
      const response = await firstValueFrom(
        this.httpService.get(addImageDto.link, {
          responseType: 'arraybuffer',
        })
      );
      if (response.status > 300) {
        throw new Error(JSON.stringify(response.data));
      }
      buffer = response.data;
      contentType = response.headers['content-type'];
    }
    const isAnimated = this.checkAnimation(contentType);
    await this.imageRepository.addImage(addImageDto.name, isAnimated);
    const image = await this.imageEditor.toWebp(buffer, isAnimated);
    const preview = await this.imageEditor.crop(
      image,
      addImageDto.x !== undefined &&
        addImageDto.y !== undefined &&
        addImageDto.width &&
        addImageDto.height
        ? {
            x: parseFloat(addImageDto.x),
            y: parseFloat(addImageDto.y),
            width: parseFloat(addImageDto.width),
            height: parseFloat(addImageDto.height),
          }
        : undefined
    );
    this.imageRepository.attachImage(addImageDto.name, image);
    this.imageRepository.attachPreview(addImageDto.name, preview);
    if (isAnimated) {
      this.imageRepository.attachOriginal(addImageDto.name, buffer);
    }
    await this.imageRepository.saveChanges();
  }

  private checkAnimation(contentType: string): boolean {
    return /gif|apng$/.test(contentType);
  }
}
