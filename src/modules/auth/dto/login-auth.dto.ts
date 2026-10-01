import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class LoginAuth{
    
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;


    @ApiProperty()
    @MinLength(6)
    @MaxLength(25)
    @IsNotEmpty()
    password: string;
}