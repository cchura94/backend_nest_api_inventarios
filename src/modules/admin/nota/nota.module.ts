import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotaService } from './nota.service.js';
import { NotaController } from './nota.controller.js';
import { Nota } from './entities/nota.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Nota])
  ],
  controllers: [NotaController],
  providers: [NotaService],
})
export class NotaModule {}
