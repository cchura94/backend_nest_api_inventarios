import { Module } from '@nestjs/common';
import { AlmacenService } from './almacen.service.js';
import { AlmacenController } from './almacen.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Almacen } from './entities/almacen.entity.js';
import { AlmacenProducto } from './entities/almacen_producto.entity.js';
import { Sucursal } from '../sucursal/entities/sucursal.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Almacen, AlmacenProducto, Sucursal])
  ],
  controllers: [AlmacenController],
  providers: [AlmacenService],
})
export class AlmacenModule {}