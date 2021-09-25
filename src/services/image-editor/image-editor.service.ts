import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

const previewSize = 300;

@Injectable()
export class ImageEditorService {
  async toWebp(buffer: Buffer, isAnimated: boolean): Promise<Buffer> {
    return sharp(buffer, { animated: isAnimated })
      .webp({ lossless: true })
      .toBuffer();
  }

  async crop(
    buffer: Buffer,
    crop?: { x: number; y: number; width: number; height: number }
  ): Promise<Buffer> {
    if (crop) {
      return sharp(buffer)
        .extract({
          left: crop.x,
          top: crop.y,
          width: crop.width,
          height: crop.height,
        })
        .resize(previewSize, previewSize)
        .webp({ lossless: true })
        .toBuffer();
    }
    return sharp(buffer)
      .resize({
        fit: 'cover',
        height: previewSize,
        width: previewSize,
      })
      .webp({ lossless: true })
      .toBuffer();
  }

  async toPng(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer).png().toBuffer();
  }
}
