import { PartialType } from '@nestjs/swagger';
import { CreateClienteproveedorDto } from './create-clienteproveedor.dto.js';

export class UpdateClienteproveedorDto extends PartialType(CreateClienteproveedorDto) {}
