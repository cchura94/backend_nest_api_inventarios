import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class MovimientoDto{

    @ApiProperty({
        example: 10
    })
    @IsInt()
    producto_id: number;

    
    @ApiProperty({
        example: 1
    })
    @IsInt()
    almacen_id: number;

    @ApiProperty({
        example: 5
    })
    @IsNumber()
    cantidad: number;

    
    @ApiProperty({
        enum: ['ingreso', 'salida', 'devolucion'],
        example: 'ingreso'
    })
    @IsEnum(['ingreso', 'salida', 'devolucion'])
    tipo_movimiento: 'ingreso' | 'salida' | 'devolucion'


    @ApiPropertyOptional({
        example: 235.20
    })
    @IsOptional()
    @IsNumber()
    precio_compra: number;

    
    @ApiPropertyOptional({
        example: 235.20
    })
    @IsOptional()
    @IsNumber()
    precio_venta: number;

    @ApiPropertyOptional({
        example: 'Movimiento generado por compra'
    })
    @IsOptional()
    @IsString()
    observaciones: string;
}


export class CreateNotaDto {

    
    /*
    @IsString()
    fecha?: string;
    */

    @ApiProperty({
        example: 'compra'
    })
    @IsString()
    tipo_nota: 'compra' | 'venta' | 'devolucion'

    @ApiProperty({
        example: 1
    })
    @IsNumber()
    clienteproveedor_id: number;

    /*
    @IsNumber()
    user_id?: number;

    @ApiPropertyOptional({
        example: 'pendiente'
    })
    @IsOptional()
    @IsString()
    estado_nota: string;
    */

    @ApiPropertyOptional({
        example: 'Observaciones generales de la nota'
    })
    @IsString()
    @IsOptional()
    observaciones: string;

    @ApiProperty({
        type: [MovimientoDto]
    })
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => MovimientoDto)
    movimientos: MovimientoDto[]


}
