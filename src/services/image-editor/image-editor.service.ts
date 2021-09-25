import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { Crop } from './crop';

const previewSize = 300;

@Injectable()
export class ImageEditorService {
  async toWebp(buffer: Buffer, isAnimated: boolean): Promise<Buffer> {
    return sharp(buffer, { animated: isAnimated })
      .webp({ lossless: true })
      .toBuffer();
  }

  async crop(buffer: Buffer, crop?: Crop): Promise<Buffer> {
    let image = sharp(buffer);
    if (crop) {
      image = image
        .extract({
          left: crop.x,
          top: crop.y,
          width: crop.width,
          height: crop.height,
        })
        .resize(previewSize, previewSize);
    } else {
      image = image.resize({
        fit: 'cover',
        height: previewSize,
        width: previewSize,
      });
    }
    return image.webp({ lossless: true }).toBuffer();
  }

  async toPng(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer).png().toBuffer();
  }
}
