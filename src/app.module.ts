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

@Module({
  imports: [UsersModule, AuthModule, InventariosModule, RoleModule, PermissionModule, ClienteproveedorModule, NotaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
