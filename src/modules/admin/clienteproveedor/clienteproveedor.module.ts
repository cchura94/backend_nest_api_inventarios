import { Module } from '@nestjs/common';
import { ClienteproveedorService } from './clienteproveedor.service.js';
import { ClienteproveedorController } from './clienteproveedor.controller.js';

@Module({
  controllers: [ClienteproveedorController],
  providers: [ClienteproveedorService],
})
export class ClienteproveedorModule {}
