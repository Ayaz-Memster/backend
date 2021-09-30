import { Injectable, Scope } from '@nestjs/common';
import { IDocumentSession } from 'ravendb';
import { RavenService } from 'src/services/raven/raven.service';
import { ImageDto } from 'src/contract/image';
import { Image, imagesCollection } from 'src/domain/image';
import { AlreadyExistsError } from 'src/errors/AlreadyExistsError';
import { PassThrough, Readable } from 'stream';
import { NotFoundError } from 'src/errors/NotFoundError';

@Injectable({ scope: Scope.REQUEST })
export class ImageRepository {
  private readonly session: IDocumentSession;

  constructor(ravenService: RavenService) {
    this.session = ravenService.openSession();
  }

  async getImagesList(search?: string): Promise<ImageDto[]> {
    let query = this.query;
    if (search) {
      query = query.whereRegex('name', search);
    }
    const images = await query.orderByDescending('uploadDateTime').all();

    return images.map(this.mapImage);
  }

  async getImage(name: string): Promise<ImageDto> {
    const image = await this.query.whereEquals('id', name).singleOrNull();

    if (!image) {
      throw new NotFoundError(`${name} image not found`);
    }
    return this.mapImage(image);
  }

  async checkAnimation(name: string): Promise<boolean> {
    return this.query
      .whereEquals('id', name)
      .single()
      .then((res) => res.isAnimated);
  }

  async addImage(name: string, isAnimated: boolean, timestamp?: number) {
    const imageExists = await this.query.whereEquals('id', name).any();
    if (imageExists) {
      throw new AlreadyExistsError('Image already exists');
    }

    const image: Image = {
      name,
      uploadDateTime: new Date().getTime(),
      isAnimated,
      collection: imagesCollection,
    };
    await this.session.store(image, name);
  }

  attachImage(name: string, buffer: Buffer) {
    this.session.advanced.attachments.store(name, 'image', buffer);
  }

  attachOriginal(name: string, buffer: Buffer) {
    this.session.advanced.attachments.store(name, 'original', buffer);
  }

  attachPreview(name: string, buffer: Buffer) {
    this.session.advanced.attachments.store(name, 'preview', buffer);
  }

  async getImageBuffer(name: string): Promise<Buffer> {
    return this.session.advanced.attachments
      .get(name, 'image')
      .then((result) => {
        const stream = result.data as PassThrough;
        return this.streamToBuffer(stream);
      });
  }

  async getPreviewBuffer(name: string): Promise<Buffer> {
    return this.session.advanced.attachments
      .get(name, 'preview')
      .then((result) => {
        const stream = result.data as PassThrough;
        return this.streamToBuffer(stream);
      });
  }

  async getOriginalBuffer(name: string): Promise<Buffer> {
    return this.session.advanced.attachments
      .get(name, 'original')
      .then((result) => {
        const stream = result.data as PassThrough;
        return this.streamToBuffer(stream);
      });
  }

  private streamToBuffer(stream: Readable): Promise<Buffer> {
    const buffer: Uint8Array[] = [];
    stream.on('data', (chunk) => {
      buffer.push(chunk);
    });
    stream.on('readable', () => {
      stream.read();
    });
    return new Promise((res, rej) => {
      stream.on('error', (err) => {
        rej(err);
      });
      stream.on('end', () => {
        res(Buffer.concat(buffer));
      });
    });
  }

  private get query() {
    return this.session.query<Image>({});
  }

  private mapImage(image: Image): ImageDto {
    return {
      name: image.name,
      uploadDateTime: image.uploadDateTime,
    };
  }

  async saveChanges() {
    await this.session.saveChanges();
  }
}
