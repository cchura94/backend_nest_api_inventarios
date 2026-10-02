import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductoDto {
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Arroz',
    maxLength: 200,
  })
  @IsNotEmpty({
    message: 'El nombre del producto es obligatorio',
  })
  @IsString({
    message: 'El nombre debe ser una cadena de texto',
  })
  @MaxLength(200, {
    message: 'El nombre no puede superar los 200 caracteres',
  })
  nombre: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Arroz de grano largo de primera calidad',
  })
  @IsNotEmpty({
    message: 'La descripción del producto es obligatoria',
  })
  @IsString({
    message: 'La descripción debe ser una cadena de texto',
  })
  descripcion: string;

  @ApiPropertyOptional({
    description: 'Código de barras del producto',
    example: '7751234567890',
  })
  @IsOptional()
  @IsString({
    message: 'El código de barra debe ser una cadena de texto',
  })
  codigo_barra?: string;

  @ApiPropertyOptional({
    description: 'Unidad de medida del producto',
    example: 'kg',
  })
  @IsOptional()
  @IsString({
    message: 'La unidad de medida debe ser una cadena de texto',
  })
  unidad_medida?: string;

  @ApiPropertyOptional({
    description: 'Marca del producto',
    example: 'Campo',
  })
  @IsOptional()
  @IsString({
    message: 'La marca debe ser una cadena de texto',
  })
  marca?: string;

  @ApiProperty({
    description: 'Precio de venta actual del producto',
    example: 35.5,
    minimum: 0,
  })
  @IsNotEmpty({
    message: 'El precio de venta es obligatorio',
  })
  @IsNumber(
    {},
    {
      message: 'El precio de venta debe ser un número',
    },
  )
  @Min(0, {
    message: 'El precio de venta no puede ser negativo',
  })
  precio_venta_actual: number;

  @ApiPropertyOptional({
    description: 'Ruta o URL de la imagen del producto',
    example: 'uploads/productos/arroz.jpg',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({
    message: 'La imagen debe ser una cadena de texto',
  })
  @MaxLength(255, {
    message: 'La ruta de la imagen no puede superar los 255 caracteres',
  })
  imagen?: string;

  @ApiProperty({
    description: 'Estado del producto',
    example: true,
    default: true,
  })
  @IsNotEmpty({
    message: 'El estado del producto es obligatorio',
  })
  @IsBoolean({
    message: 'El estado debe ser verdadero o falso',
  })
  estado: boolean;

  @ApiProperty({
    description: 'ID de la categoría a la que pertenece el producto',
    example: 1,
  })
  @IsNotEmpty({
    message: 'La categoría es obligatoria',
  })
  @IsInt({
    message: 'El ID de la categoría debe ser un número entero',
  })
  @Min(1, {
    message: 'El ID de la categoría debe ser mayor a 0',
  })
  categoriaId: number;
}