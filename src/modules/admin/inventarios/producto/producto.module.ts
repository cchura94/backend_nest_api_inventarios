import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service.js';
import { ProductoController } from './producto.controller.js';

@Module({
  controllers: [ProductoController],
  providers: [ProductoService],
})
export class ProductoModule {}
