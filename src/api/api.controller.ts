import { HttpService } from '@nestjs/axios';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import { AddImageDto, ImageDto } from 'src/contract/image';
import { ImageEditorService } from 'src/image-editor/image-editor.service';
import { ImageRepository } from 'src/image/image.repository';

@Controller('api')
export class ApiController {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly httpService: HttpService,
    private readonly imageEditor: ImageEditorService
  ) {}

  @Get()
  async getImages(
    @Query('search') search: string | undefined
  ): Promise<ImageDto[]> {
    return this.imageRepository.getImagesList(search ?? '');
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async addImage(
    @Body() addImageDto: AddImageDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    await this.imageRepository.addImage(addImageDto.name);
    let buffer: Buffer;
    if (file) {
      buffer = file.buffer;
    } else {
      if (!addImageDto.link) {
        throw new Error('Link is not provided');
      }
      const response = await firstValueFrom(
        this.httpService.get(addImageDto.link, {
          responseType: 'stream',
        })
      );
      buffer = response.data;
    }
    const image = await this.imageEditor.toWebp(buffer);
    const preview = await this.imageEditor.crop(image, {
      x: parseFloat(addImageDto.x),
      y: parseFloat(addImageDto.y),
      width: parseFloat(addImageDto.width),
      height: parseFloat(addImageDto.height),
    });
    this.imageRepository.attachImage(addImageDto.name, image);
    this.imageRepository.attachPreview(addImageDto.name, preview);
    await this.imageRepository.saveChanges();
  }
}
