import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { In, Repository } from 'typeorm';
import { Role } from '../role/entities/role.entity.js';

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

    const nuevoUser = this.userRepository.create({
      name, email, password: restData.password, roles
    })
    
    return await this.userRepository.save(nuevoUser);
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

  async update(id: string, updateUserDto: UpdateUserDto) {

    const usuario = await this.findOne(id);


    return `This action updates a #${id} user`;
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
