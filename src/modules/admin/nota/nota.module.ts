import { Module } from '@nestjs/common';
import { NotaService } from './nota.service.js';
import { NotaController } from './nota.controller.js';

@Module({
  controllers: [NotaController],
  providers: [NotaService],
})
export class NotaModule {}
