import { Test, TestingModule } from '@nestjs/testing';
import { ImageRepository } from './image.repository';

describe('ImageRepository', () => {
  let service: ImageRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageRepository],
    }).compile();

    service = module.get<ImageRepository>(ImageRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
