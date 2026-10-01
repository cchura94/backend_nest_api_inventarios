import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';
import { LoginAuth } from './dto/login-auth.dto.js';


@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService){}

    @Post("/login")
    funIngresar(@Body() datos: LoginAuth){
        return this.authService.login(datos.email, datos.password);
    }

    @UseGuards(AuthGuard)
    @Get("/profile")
    funProfile(@Request() req: any){
        return this.authService.funGetPerfil(req.user.email)
    }

}
