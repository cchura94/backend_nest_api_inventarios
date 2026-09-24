import { Module } from '@nestjs/common';
import { AlmacenService } from './almacen.service.js';
import { AlmacenController } from './almacen.controller.js';

@Module({
  controllers: [AlmacenController],
  providers: [AlmacenService],
})
export class AlmacenModule {}
