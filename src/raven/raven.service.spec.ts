import { Test, TestingModule } from '@nestjs/testing';
import { RavenService } from './raven.service';

describe('RavenService', () => {
  let service: RavenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RavenService],
    }).compile();

    service = module.get<RavenService>(RavenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
