import { PartialType } from '@nestjs/swagger';
import { CreateSucursalDto } from './create-sucursal.dto.js';

export class UpdateSucursalDto extends PartialType(CreateSucursalDto) {}
