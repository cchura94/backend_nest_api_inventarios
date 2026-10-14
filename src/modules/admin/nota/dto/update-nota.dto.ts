import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateNotaDto } from './create-nota.dto.js';

export class UpdateNotaDto extends PartialType(CreateNotaDto) {

  @ApiPropertyOptional({
    example: 'aprobada',
    description: 'Estado de la nota (ej: pendiente, aprobada, anulada)',
  })
  @IsOptional()
  @IsString()
  estado_nota?: string;
}
