import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service.js';
import { ProductoController } from './producto.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity.js';
import { Categoria } from '../categoria/entities/categoria.entity.js';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, Categoria]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        }
      })
    })
  ],
  controllers: [ProductoController],
  providers: [ProductoService],
})
export class ProductoModule {}
