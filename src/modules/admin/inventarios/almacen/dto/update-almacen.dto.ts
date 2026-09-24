import { PartialType } from '@nestjs/swagger';
import { CreateAlmacenDto } from './create-almacen.dto.js';

export class UpdateAlmacenDto extends PartialType(CreateAlmacenDto) {}
