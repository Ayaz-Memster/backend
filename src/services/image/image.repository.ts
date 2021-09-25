import { Injectable, Scope } from '@nestjs/common';
import { IDocumentSession } from 'ravendb';
import { RavenService } from 'src/services/raven/raven.service';
import { ImageDto } from 'src/contract/image';
import { Image } from 'src/domain/image';
import { AlreadyExistsError } from 'src/errors/AlreadyExistsError';
import { PassThrough } from 'stream';

@Injectable({ scope: Scope.REQUEST })
export class ImageRepository {
  private readonly session: IDocumentSession;

  constructor(ravenService: RavenService) {
    this.session = ravenService.openSession();
  }

  async getImagesList(search: string): Promise<ImageDto[]> {
    const images = await this.session
      .query<Image>({})
      .whereRegex('name', search)
      .all();

    return images.map((item) => ({
      name: item.name,
      uploadDateTime: item.uploadDateTime,
    }));
  }

  async checkAnimation(name: string): Promise<boolean> {
    return this.session
      .query<Image>({})
      .whereEquals('id', name)
      .single()
      .then((res) => res.isAnimated);
  }

  async addImage(name: string, isAnimated: boolean, timestamp?: number) {
    const imageExists = await this.session
      .query({})
      .whereEquals('id', name)
      .any();
    if (imageExists) {
      throw new AlreadyExistsError('Image already exists');
    }

    const image: Image = {
      name,
      uploadDateTime: new Date().toISOString(),
      isAnimated,
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

  async getImage(name: string): Promise<Buffer> {
    return this.session.advanced.attachments
      .get(name, 'image')
      .then((result) => {
        const buffer: Uint8Array[] = [];
        const data = result.data as PassThrough;
        data.on('readable', () => {
          while (true) {
            const chunk = data.read();
            if (!chunk) {
              break;
            }
            buffer.push(chunk);
          }
        });
        return new Promise((res) => {
          data.on('end', () => {
            res(Buffer.concat(buffer));
          });
        });
      });
  }

  async getPreview(name: string): Promise<Buffer> {
    return this.session.advanced.attachments
      .get(name, 'preview')
      .then((result) => {
        const buffer: Uint8Array[] = [];
        const data = result.data as PassThrough;
        data.on('readable', () => {
          while (true) {
            const chunk = data.read();
            if (!chunk) {
              break;
            }
            buffer.push(chunk);
          }
        });
        return new Promise((res) => {
          data.on('end', () => {
            res(Buffer.concat(buffer));
          });
        });
      });
  }

  async getOriginal(name: string): Promise<Buffer> {
    return this.session.advanced.attachments
      .get(name, 'original')
      .then((result) => {
        const buffer: Uint8Array[] = [];
        const data = result.data as PassThrough;
        data.on('readable', () => {
          while (true) {
            const chunk = data.read();
            if (!chunk) {
              break;
            }
            buffer.push(chunk);
          }
        });
        return new Promise((res) => {
          data.on('end', () => {
            res(Buffer.concat(buffer));
          });
        });
      });
  }

  async saveChanges() {
    await this.session.saveChanges();
  }
}
