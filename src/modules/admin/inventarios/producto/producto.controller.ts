import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductoService } from './producto.service.js';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';
import { ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('producto')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Post()
  create(@Body() createProductoDto: CreateProductoDto) {
    return this.productoService.create(createProductoDto);
  }


  @Get()
  @ApiQuery({name: 'search', required: false, type: String})
  @ApiQuery({name: 'almacen', required: false, type: Number})
  findAll(
    @Query('page') page:number = 1,
    @Query('limit') limit: number = 10,
    @Query('almacen') almacen?: number,
    @Query('search') search?: string,
    @Query('estado') estado?: boolean  
    
  ) {
    return this.productoService.findAll(page, limit, search, almacen, estado);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto) {
    return this.productoService.update(+id, updateProductoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productoService.remove(+id);
  }

  @Post(':id/actualizar-imagen')
  @UseInterceptors(FileInterceptor('imagen'))
  subirImagen(
    @UploadedFile()
    file: Express.Multer.File,
    @Param('id') id: number
  ){

    return this.productoService.subirImagen(file, id);

  }

}
