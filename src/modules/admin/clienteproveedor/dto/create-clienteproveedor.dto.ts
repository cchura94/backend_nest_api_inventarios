import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClienteproveedorDto {

  @ApiProperty({
    description: 'Tipo de registro',
    example: 'cliente',
    enum: ['cliente', 'proveedor'],
  })
  @IsNotEmpty({ message: 'El tipo es obligatorio' })
  @IsIn(['cliente', 'proveedor'], {
    message: 'El tipo debe ser "cliente" o "proveedor"',
  })
  tipo: 'cliente' | 'proveedor';

  @ApiProperty({
    description: 'Razón social o nombre completo',
    example: 'Distribuidora Andina S.A.',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'La razón social es obligatoria' })
  @IsString({ message: 'La razón social debe ser una cadena de texto' })
  @MaxLength(255, {
    message: 'La razón social no puede superar los 255 caracteres',
  })
  razon_social: string;

  @ApiPropertyOptional({
    description: 'Identificación (CI, NIT, RUC, etc.)',
    example: '1234567019',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'La identificación debe ser una cadena de texto' })
  @MaxLength(100, {
    message: 'La identificación no puede superar los 100 caracteres',
  })
  identificacion?: string;

  @ApiPropertyOptional({
    description: 'Dirección',
    example: 'Av. Siempre Viva 742',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @MaxLength(255, {
    message: 'La dirección no puede superar los 255 caracteres',
  })
  direccion?: string;

  @ApiPropertyOptional({
    description: 'Teléfono',
    example: '77712345',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @MaxLength(20, {
    message: 'El teléfono no puede superar los 20 caracteres',
  })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico',
    example: 'contacto@empresa.com',
    maxLength: 200,
  })
  @IsOptional()
  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  @MaxLength(200, {
    message: 'El correo no puede superar los 200 caracteres',
  })
  correo?: string;

  @ApiPropertyOptional({
    description: 'Estado activo/inactivo (por defecto true)',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser booleano' })
  estado?: boolean;
}
