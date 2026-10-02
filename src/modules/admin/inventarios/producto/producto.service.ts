import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity.js';
import { Repository } from 'typeorm';
import { Categoria } from '../categoria/entities/categoria.entity.js';

@Injectable()
export class ProductoService {

  constructor(
      @InjectRepository(Producto)
      private prodRepository: Repository<Producto>,
      @InjectRepository(Categoria)
      private cateRepository: Repository<Categoria>
    ){
  
    }

  async create(createProductoDto: CreateProductoDto) {
    const categoria = await this.cateRepository.findOne({where: {id: createProductoDto.categoriaId}});
    if(!categoria) throw new NotFoundException('Categoria no encontrada');
    
    const producto = this.prodRepository.create({...createProductoDto, categoria});
    return this.prodRepository.save(producto);
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, almacen?:number, estado:boolean=true) {

    const queryBuilder = this.prodRepository.createQueryBuilder('producto')
                                            .leftJoinAndSelect('producto.almacenes', 'productoAlmacen')
                                            .leftJoinAndSelect('productoAlmacen.almacen', 'almacen')
                                            .where('producto.estado = :estado', {estado});
                   
    if(search){
      queryBuilder.andWhere('(producto.nombre ILIKE :search)', {search: `%${search}%`})
    }

    if(almacen && almacen>0){
      queryBuilder.andWhere('almacen.id = :almacen', {almacen})
    }

    queryBuilder.skip((page-1) * limit).take(limit);

    const [productos, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total/limit);

    return {
      data: productos,
      total,
      limit,
      page,
      totalPages,
      estado,
      almacen,
      search
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} producto`;
  }

  update(id: number, updateProductoDto: UpdateProductoDto) {
    return `This action updates a #${id} producto`;
  }

  remove(id: number) {
    return `This action removes a #${id} producto`;
  }
}
