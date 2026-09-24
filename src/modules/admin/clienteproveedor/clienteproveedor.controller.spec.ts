import { Test, TestingModule } from '@nestjs/testing';
import { ClienteproveedorController } from './clienteproveedor.controller.js';
import { ClienteproveedorService } from './clienteproveedor.service.js';

describe('ClienteproveedorController', () => {
  let controller: ClienteproveedorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClienteproveedorController],
      providers: [ClienteproveedorService],
    }).compile();

    controller = module.get<ClienteproveedorController>(ClienteproveedorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
