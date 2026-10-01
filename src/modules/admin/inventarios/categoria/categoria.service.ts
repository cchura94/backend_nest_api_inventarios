import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';
import { Categoria } from './entities/categoria.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoriaService {

  constructor(
    @InjectRepository(Categoria)
    private catRepository: Repository<Categoria>
  ){

  }

  create(createCategoriaDto: CreateCategoriaDto) {

    const categoria = this.catRepository.create(createCategoriaDto);
    return this.catRepository.save(categoria);

  }

  findAll() {
    return this.catRepository.find();
  }

  async findOne(id: number) {
    const cate = await this.catRepository.findOneBy({id});
    if(!cate) throw new NotFoundException('La categoria no existe');
    return cate;
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    const categoria = await this.findOne(id);

    this.catRepository.merge(categoria, updateCategoriaDto);
    return this.catRepository.save(categoria);
  }

  remove(id: number) {
    
  }
}
