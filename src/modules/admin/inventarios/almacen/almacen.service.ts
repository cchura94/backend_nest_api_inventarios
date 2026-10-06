import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateAlmacenDto } from './dto/create-almacen.dto.js';
import { UpdateAlmacenDto } from './dto/update-almacen.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Almacen } from './entities/almacen.entity.js';
import { AlmacenProducto } from './entities/almacen_producto.entity.js';
import { Sucursal } from '../sucursal/entities/sucursal.entity.js';

@Injectable()
export class AlmacenService {

  constructor(
    @InjectRepository(Almacen)
    private almRepository: Repository<Almacen>,
    @InjectRepository(Sucursal)
    private sucRepository: Repository<Sucursal>,
    @InjectRepository(AlmacenProducto)
    private almProdRepository: Repository<AlmacenProducto>
  ){

  }

  async create(createAlmacenDto: CreateAlmacenDto) {

    const sucursal = await this.sucRepository.findOne({where: {id: createAlmacenDto.sucursalId}});
    if(!sucursal) throw new NotFoundException('La sucursal no encontrada');

    const almacen = this.almRepository.create({
      nombre: createAlmacenDto.nombre,
      codigo: createAlmacenDto.codigo,
      descripcion: createAlmacenDto.descripcion,
      sucursal
    });
    return this.almRepository.save(almacen);

  }

  findAll() {
    return this.almRepository.find({
      relations: {productos: {producto: true}}
    });
  }

  async findOne(id: number) {
    const almacen = await this.almRepository.findOne({
      where: {id},
      relations: {productos: {producto: true}}
    });

    if(!almacen) throw new NotFoundException('El almacen no existe');
    return almacen;
  }

  async update(id: number, updateAlmacenDto: UpdateAlmacenDto) {
    const almacen = await this.findOne(id);

    const {sucursalId, ...datos} = updateAlmacenDto;

    if(sucursalId !== undefined){
      const sucursal = await this.sucRepository.findOne({where: {id: sucursalId}});
      if(!sucursal) throw new NotFoundException('La sucursal no encontrada');

      almacen.sucursal = sucursal;
    }

    this.almRepository.merge(almacen, datos);
    return this.almRepository.save(almacen);
  }

  async remove(id: number) {
    const almacen = await this.findOne(id);

    const totalProductos = await this.almProdRepository.count({where: {almacen: {id}}});

    if(totalProductos > 0){
      throw new ConflictException(
        `El almacen tiene ${totalProductos} producto(s) asociado(s), no se puede eliminar`
      );
    }

    await this.almRepository.remove(almacen);
    return {message: 'El almacen fue eliminado'};
  }
}