import { Injectable } from '@nestjs/common';
import { CreateClienteproveedorDto } from './dto/create-clienteproveedor.dto.js';
import { UpdateClienteproveedorDto } from './dto/update-clienteproveedor.dto.js';

@Injectable()
export class ClienteproveedorService {
  create(createClienteproveedorDto: CreateClienteproveedorDto) {
    return 'This action adds a new clienteproveedor';
  }

  findAll() {
    return `This action returns all clienteproveedor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} clienteproveedor`;
  }

  update(id: number, updateClienteproveedorDto: UpdateClienteproveedorDto) {
    return `This action updates a #${id} clienteproveedor`;
  }

  remove(id: number) {
    return `This action removes a #${id} clienteproveedor`;
  }
}
