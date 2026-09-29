import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './modules/admin/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { InventariosModule } from './modules/admin/inventarios/inventarios.module.js';
import { RoleModule } from './modules/admin/role/role.module.js';
import { PermissionModule } from './modules/admin/permission/permission.module.js';
import { ClienteproveedorModule } from './modules/admin/clienteproveedor/clienteproveedor.module.js';
import { NotaModule } from './modules/admin/nota/nota.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

@Module({
  imports: [
    ConfigModule.forRoot(),// habilita variables de entorno (process.env)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.BD_HOST,
      port: Number(process.env.BD_PORT) || 5432,
      username: process.env.BD_USERNAME,
      password: process.env.BD_PASSWORD,
      database: process.env.BD_DATABASE,
      entities: [
        __dirname + '../**/*.entity{.ts,.js}'
      ],
      synchronize: false,
    }),
    UsersModule, AuthModule, InventariosModule, RoleModule, PermissionModule, ClienteproveedorModule, NotaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
