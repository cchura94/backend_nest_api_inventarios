import { Module } from '@nestjs/common';
import { CategoriaService } from './categoria.service.js';
import { CategoriaController } from './categoria.controller.js';

@Module({
  controllers: [CategoriaController],
  providers: [CategoriaService],
})
export class CategoriaModule {}
