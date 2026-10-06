import { Module } from '@nestjs/common';
import { SucursalService } from './sucursal.service.js';
import { SucursalController } from './sucursal.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sucursal } from './entities/sucursal.entity.js';
import { Almacen } from '../almacen/entities/almacen.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sucursal, Almacen])
  ],
  controllers: [SucursalController],
  providers: [SucursalService],
})
export class SucursalModule {}