import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteproveedorService } from './clienteproveedor.service.js';
import { ClienteproveedorController } from './clienteproveedor.controller.js';
import { Clienteproveedor } from './entities/clienteproveedor.entity.js';
import { Nota } from '../nota/entities/nota.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Clienteproveedor, Nota])
  ],
  controllers: [ClienteproveedorController],
  providers: [ClienteproveedorService],
})
export class ClienteproveedorModule {}
