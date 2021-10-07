import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { DocumentStore, IDocumentSession } from 'ravendb';

@Injectable()
export class RavenService {
  private readonly store: DocumentStore;

  constructor(configService: ConfigService) {
    const dbUrl = configService.get('DB_URL');
    if (!dbUrl) {
      throw new Error('DB_URL is not provided');
    }
    const dbDatabase = configService.get('DB_DATABASE');
    if (!dbDatabase) {
      throw new Error('DB_DATABASE is not provided');
    }
    const dbCertificate = configService.get('DB_CERTIFICATE');
    if (!dbCertificate) {
      throw new Error('DB_CERTIFICATE is not provided');
    }

    this.store = new DocumentStore(dbUrl, dbDatabase, {
      certificate: dbCertificate,
      type: 'pem',
    });
    this.store.conventions.findCollectionNameForObjectLiteral = (entity) => {
      return entity['collection'];
    };
    this.store.initialize();
  }

  openSession(): IDocumentSession {
    return this.store.openSession();
  }
}
