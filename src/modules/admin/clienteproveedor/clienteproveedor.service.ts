import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClienteproveedorDto } from './dto/create-clienteproveedor.dto.js';
import { UpdateClienteproveedorDto } from './dto/update-clienteproveedor.dto.js';
import { Clienteproveedor } from './entities/clienteproveedor.entity.js';
import { Nota } from '../nota/entities/nota.entity.js';

@Injectable()
export class ClienteproveedorService {

  constructor(
    @InjectRepository(Clienteproveedor)
    private cpRepository: Repository<Clienteproveedor>,
    @InjectRepository(Nota)
    private notaRepository: Repository<Nota>,
  ) {}

  create(createClienteproveedorDto: CreateClienteproveedorDto) {
    const cp = this.cpRepository.create({
      ...createClienteproveedorDto,
      estado: createClienteproveedorDto.estado ?? true,
    });
    return this.cpRepository.save(cp);
  }

  findAll() {
    return this.cpRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const cp = await this.cpRepository.findOneBy({ id });
    if (!cp) throw new NotFoundException('El cliente/proveedor no existe');
    return cp;
  }

  async update(id: number, updateClienteproveedorDto: UpdateClienteproveedorDto) {
    const cp = await this.findOne(id);
    this.cpRepository.merge(cp, updateClienteproveedorDto);
    return this.cpRepository.save(cp);
  }

  async remove(id: number) {
    const cp = await this.findOne(id);

    const totalNotas = await this.notaRepository.count({
      where: { clienteproveedor: { id } },
    });

    if (totalNotas > 0) {
      throw new ConflictException(
        `El cliente/proveedor tiene ${totalNotas} nota(s) asociada(s), no se puede eliminar`,
      );
    }

    await this.cpRepository.remove(cp);
    return { message: 'El cliente/proveedor fue eliminado' };
  }
}
