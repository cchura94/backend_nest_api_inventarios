import { HttpException, Injectable } from '@nestjs/common';
import { UsersService } from '../admin/users/users.service.js';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(private userService: UsersService, private jwtService: JwtService){}

    async login(email: string, password: string){
        // buscar user por email
        const usuario = await this.userService.buscarUserPorEmail(email);

        // verificar contraseña
        const verificarPass = await compare(password, usuario.password);
        if(!verificarPass) throw new HttpException('Contraseña Incorrecta', 401);

        // JWT (JSON WEB TOKEN) // JWT (JSON WEB TOKEN)
        const payload = {
            sub: usuario.id,
            email: usuario.email
        }

        const access_token = await this.jwtService.signAsync(payload);

        return { usuario, access_token }
    }
}
