import { Injectable, OnModuleDestroy, Scope } from '@nestjs/common';
import { IDocumentSession } from 'ravendb';
import { RavenService } from 'src/raven/raven.service';
import { ImageDto } from 'src/contract/image';
import { Image } from 'src/domain/image';

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
      extension: item.extension,
      uploadDateTime: item.uploadDateTime,
    }));
  }

  async addImage(name: string) {
    const image: Image = {
      name,
      uploadDateTime: new Date().toISOString(),
      extension: 'png',
    };
    await this.session.store(image, name);
  }

  attachImage(name: string, buffer: Buffer) {
    this.session.advanced.attachments.store(name, 'image', buffer);
  }

  attachPreview(name: string, buffer: Buffer) {
    this.session.advanced.attachments.store(name, 'preview', buffer);
  }

  async saveChanges() {
    await this.session.saveChanges();
  }
}
