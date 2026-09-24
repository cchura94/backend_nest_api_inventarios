import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClienteproveedorService } from './clienteproveedor.service.js';
import { CreateClienteproveedorDto } from './dto/create-clienteproveedor.dto.js';
import { UpdateClienteproveedorDto } from './dto/update-clienteproveedor.dto.js';

@Controller('clienteproveedor')
export class ClienteproveedorController {
  constructor(private readonly clienteproveedorService: ClienteproveedorService) {}

  @Post()
  create(@Body() createClienteproveedorDto: CreateClienteproveedorDto) {
    return this.clienteproveedorService.create(createClienteproveedorDto);
  }

  @Get()
  findAll() {
    return this.clienteproveedorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clienteproveedorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClienteproveedorDto: UpdateClienteproveedorDto) {
    return this.clienteproveedorService.update(+id, updateClienteproveedorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clienteproveedorService.remove(+id);
  }
}
