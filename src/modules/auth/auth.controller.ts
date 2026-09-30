import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';

interface LoginAuthDto {
    email: string,
    password: string
}

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService){}

    @Post("/login")
    funIngresar(@Body() datos: LoginAuthDto){
        return this.authService.login(datos.email, datos.password);
    }

}
