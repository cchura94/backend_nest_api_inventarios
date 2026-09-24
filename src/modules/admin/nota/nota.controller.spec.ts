import { Test, TestingModule } from '@nestjs/testing';
import { NotaController } from './nota.controller.js';
import { NotaService } from './nota.service.js';

describe('NotaController', () => {
  let controller: NotaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotaController],
      providers: [NotaService],
    }).compile();

    controller = module.get<NotaController>(NotaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
