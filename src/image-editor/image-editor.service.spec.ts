import { Test, TestingModule } from '@nestjs/testing';
import { ImageEditorService } from './image-editor.service';

describe('ImageEditorService', () => {
  let service: ImageEditorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageEditorService],
    }).compile();

    service = module.get<ImageEditorService>(ImageEditorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
