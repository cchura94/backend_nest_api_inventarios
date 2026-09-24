import { Module } from '@nestjs/common';
import { ProductoModule } from './producto/producto.module.js';
import { AlmacenModule } from './almacen/almacen.module.js';
import { SucursalModule } from './sucursal/sucursal.module.js';
import { CategoriaModule } from './categoria/categoria.module.js';

@Module({
  imports: [CategoriaModule, ProductoModule, AlmacenModule, SucursalModule]
})
export class InventariosModule {}
