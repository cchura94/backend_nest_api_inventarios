import { Injectable } from '@nestjs/common';
import { CreateNotaDto } from './dto/create-nota.dto.js';
import { UpdateNotaDto } from './dto/update-nota.dto.js';

@Injectable()
export class NotaService {
  create(createNotaDto: CreateNotaDto) {
    return 'This action adds a new nota';
  }

  findAll() {
    return `This action returns all nota`;
  }

  findOne(id: number) {
    return `This action returns a #${id} nota`;
  }

  update(id: number, updateNotaDto: UpdateNotaDto) {
    return `This action updates a #${id} nota`;
  }

  remove(id: number) {
    return `This action removes a #${id} nota`;
  }
}
