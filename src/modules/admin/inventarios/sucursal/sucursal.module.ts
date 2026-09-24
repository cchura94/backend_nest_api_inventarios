import { Module } from '@nestjs/common';
import { SucursalService } from './sucursal.service.js';
import { SucursalController } from './sucursal.controller.js';

@Module({
  controllers: [SucursalController],
  providers: [SucursalService],
})
export class SucursalModule {}
