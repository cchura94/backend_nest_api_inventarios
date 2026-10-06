import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateSucursalDto } from './dto/create-sucursal.dto.js';
import { UpdateSucursalDto } from './dto/update-sucursal.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sucursal } from './entities/sucursal.entity.js';
import { Almacen } from '../almacen/entities/almacen.entity.js';

@Injectable()
export class SucursalService {

  constructor(
    @InjectRepository(Sucursal)
    private sucRepository: Repository<Sucursal>,
    @InjectRepository(Almacen)
    private almRepository: Repository<Almacen>
  ){

  }

  create(createSucursalDto: CreateSucursalDto) {

    const sucursal = this.sucRepository.create(createSucursalDto);
    return this.sucRepository.save(sucursal);

  }

  findAll() {
    return this.sucRepository.find({
      relations: {almacenes: true}
    });
  }

  async findOne(id: number) {
    const sucursal = await this.sucRepository.findOne({
      where: {id},
      relations: {almacenes: true}
    });

    if(!sucursal) throw new NotFoundException('La sucursal no existe');
    return sucursal;
  }

  async update(id: number, updateSucursalDto: UpdateSucursalDto) {
    const sucursal = await this.findOne(id);

    this.sucRepository.merge(sucursal, updateSucursalDto);
    return this.sucRepository.save(sucursal);
  }

  async remove(id: number) {
    const sucursal = await this.findOne(id);

    const totalAlmacenes = await this.almRepository.count({where: {sucursal: {id}}});

    if(totalAlmacenes > 0){
      throw new ConflictException(
        `La sucursal tiene ${totalAlmacenes} almacen(es) asociado(s), no se puede eliminar`
      );
    }

    await this.sucRepository.remove(sucursal);
    return {message: 'La sucursal fue eliminada'};
  }
}
