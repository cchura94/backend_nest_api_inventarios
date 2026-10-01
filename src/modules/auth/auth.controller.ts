import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';

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

    @UseGuards(AuthGuard)
    @Get("/profile")
    funProfile(@Request() req: any){
        return this.authService.funGetPerfil(req.user.email)
    }

}
