import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { In, Repository } from 'typeorm';
import { Role } from '../role/entities/role.entity.js';
import bcrypt from "bcrypt"

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) 
    private userRepository: Repository<User>){}


  async create(createUserDto: CreateUserDto) {
    const { email, name, roleIds, ...restData } = createUserDto;

    // verificar si ya existe el correo en la BD
    const existeEmail = await this.userRepository.findOne({where: {email: email}});
    if(existeEmail){
      throw new BadRequestException(`El correo ${email} ya está en uso`);
    }

    // asignar roles a usuario
    let roles: Role[] = [];
    if(roleIds?.length){
      //roles = await this.roleRepository.find({where: {id: In(roleIds)}});
    }

    // encriptar con bcrypt
    const hashPassword = await bcrypt.hash(restData.password, 12);


    const nuevoUser = this.userRepository.create({
      name, email, password: hashPassword, roles
    })
    
    const usuarioRegistrado = await this.userRepository.save(nuevoUser);
    const {password, ...resto_datos} = usuarioRegistrado;
    return resto_datos;

  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: string) {
    const usuario = await this.userRepository.findOneBy({id: id})
    if(!usuario){
      throw new NotFoundException("El usuario no se encuentra en la BD");
    }
    return usuario;
  }

  async buscarUserPorEmail(email: string){
    const usuario = await this.userRepository.findOneBy({email: email});
    if(!usuario){
      throw new NotFoundException("El usuario no se encuentra en la BD");
    }
    return usuario;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {

    const usuario = await this.findOne(id);
    if(!usuario){
      throw new NotFoundException('El usuario no se encuentra en la BD');
    }

    const {email, name, password} = updateUserDto;

    // verificar el email
    if(email && email !== usuario.email){
      const existeEmail = await this.userRepository.findOne({where: {email: email}});
      if(existeEmail){
        throw new BadRequestException(`El Correo ${email} ya está en uso`)
      }

      usuario.email = email;
    }
    
    // actualizar el nombre
    if(name !== undefined){
      usuario.name = name;
    }

    if(password){
      usuario.password = await bcrypt.hash(password, 12);
    }

    const usuarioActualizado = await this.userRepository.save(usuario);

    const {password: _, ...restoDatos} = usuarioActualizado;

    return restoDatos;
  }

  async remove(id: string) {
    const usuario = await this.findOne(id);
    if(usuario){
      await this.userRepository.remove(usuario);
    }
    return {
      message: `Usuario con ID ${id} eliminado correctamente`
    };

  }
}
