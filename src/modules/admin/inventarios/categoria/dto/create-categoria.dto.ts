import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateCategoriaDto {

    @ApiProperty()
    @IsNotEmpty()
    nombre: string;

    @IsOptional()
    descripcion: string

}
