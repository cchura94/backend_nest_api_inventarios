import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './modules/admin/users/users.module.js';
import { CategoriaModule } from './modules/admin/inventarios/categoria/categoria.module.js';

@Module({
  imports: [UsersModule, CategoriaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
