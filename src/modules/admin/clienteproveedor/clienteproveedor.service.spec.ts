import { Test, TestingModule } from '@nestjs/testing';
import { ClienteproveedorService } from './clienteproveedor.service.js';

describe('ClienteproveedorService', () => {
  let service: ClienteproveedorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClienteproveedorService],
    }).compile();

    service = module.get<ClienteproveedorService>(ClienteproveedorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
