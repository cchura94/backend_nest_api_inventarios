import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service.js';
import { ProductoController } from './producto.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity.js';
import { Categoria } from '../categoria/entities/categoria.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Categoria])],
  controllers: [ProductoController],
  providers: [ProductoService],
})
export class ProductoModule {}
