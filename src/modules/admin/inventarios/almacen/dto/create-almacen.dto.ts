import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAlmacenDto {

  @ApiProperty({
    description: 'Nombre del almacen',
    example: 'Almacen Central',
    maxLength: 100,
  })
  @IsNotEmpty({
    message: 'El nombre del almacen es obligatorio',
  })
  @IsString({
    message: 'El nombre debe ser una cadena de texto',
  })
  @MaxLength(100, {
    message: 'El nombre no puede superar los 100 caracteres',
  })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Código del almacen',
    example: 'ALM-001',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({
    message: 'El código debe ser una cadena de texto',
  })
  @MaxLength(100, {
    message: 'El código no puede superar los 100 caracteres',
  })
  codigo?: string;

  @ApiPropertyOptional({
    description: 'Descripción del almacen',
    example: 'Almacén principal de la sucursal central',
  })
  @IsOptional()
  @IsString({
    message: 'La descripción debe ser una cadena de texto',
  })
  descripcion?: string;

  @ApiProperty({
    description: 'ID de la sucursal a la que pertenece el almacen',
    example: 1,
  })
  @IsNotEmpty({
    message: 'La sucursal es obligatoria',
  })
  @IsInt({
    message: 'El ID de la sucursal debe ser un número entero',
  })
  @Min(1, {
    message: 'El ID de la sucursal debe ser mayor a 0',
  })
  sucursalId: number;
}