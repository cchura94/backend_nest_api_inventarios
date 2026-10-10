import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotaDto } from './dto/create-nota.dto.js';
import { UpdateNotaDto } from './dto/update-nota.dto.js';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Clienteproveedor } from '../clienteproveedor/entities/clienteproveedor.entity.js';
import { Nota } from './entities/nota.entity.js';
import { Producto } from '../inventarios/producto/entities/producto.entity.js';
import { Almacen } from '../inventarios/almacen/entities/almacen.entity.js';
import { Movimiento } from './entities/movimiento.entity.js';
import { QueryRunner } from 'typeorm/browser';
import { AlmacenProducto } from '../inventarios/almacen/entities/almacen_producto.entity.js';

@Injectable()
export class NotaService {

  constructor(
    @InjectDataSource()
    private dataSource: DataSource
  ){}

  async create(createNotaDto: CreateNotaDto) {
    // transacciones
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userRepo = queryRunner.manager.getRepository(User);
      const clieProvRep = queryRunner.manager.getRepository(Clienteproveedor);
      const notaRepo = queryRunner.manager.getRepository(Nota);
      const productoRepo = queryRunner.manager.getRepository(Producto);
      const almacenRepo = queryRunner.manager.getRepository(Almacen);
      const movimientoRepo = queryRunner.manager.getRepository(Movimiento)

      const clienteproveedor = await clieProvRep.findOneBy({
        id: createNotaDto.clienteproveedor_id
      })
      if(!clienteproveedor){
        throw new NotFoundException('Cliente/Proveedor no encontrado');
      }
      // Crear Nota
      const nota = await notaRepo.create({
        ...createNotaDto,
        fecha: new Date(),
        estado_nota: "pendiente",
        clienteproveedor: clienteproveedor,
      })

      await notaRepo.save(nota);

      const movimientosGuardados:Movimiento[] = [];

      for ( const m of createNotaDto.movimientos) {
        const producto = await productoRepo.findOneBy({id: m.producto_id})
        if(!producto) throw new NotFoundException('Producto no encontrado');

        const almacen = await almacenRepo.findOneBy({id: m.almacen_id});
        if(!almacen) throw new NotFoundException('Almacen no encontrado');

        const movimiento = movimientoRepo.create({
          ...m, nota: nota, producto, almacen
        })

        //actualizar stock inventarios
       
        await this.actualizarStockQueryRunner(
          queryRunner, almacen, producto, m.cantidad, m.tipo_movimiento
        );

        const movGuardado = await movimientoRepo.save(movimiento)
        movimientosGuardados.push(movGuardado)
      }

      nota.movimientos = movimientosGuardados;
      await queryRunner.commitTransaction();
      return nota;
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error

    }
  }

  findAll() {
    return `This action returns all nota`;
  }

  findOne(id: number) {
    return `This action returns a #${id} nota`;
  }

  update(id: number, updateNotaDto: UpdateNotaDto) {
    return `This action updates a #${id} nota`;
  }

  remove(id: number) {
    return `This action removes a #${id} nota`;
  }

  async actualizarStockQueryRunner(queryRunner:QueryRunner, almacen:Almacen, producto:Producto, cantidad: number, tipo_movimiento: 'ingreso' | 'salida' | 'devolucion'){
    const almacenProductoRepo = queryRunner.manager.getRepository(AlmacenProducto);
    
    let ap = await almacenProductoRepo.findOne({
      where: {
        almacen: {id: almacen.id},
        producto: {id: producto.id}
      }
    })

    if(!ap){
      if(tipo_movimiento === 'salida'){
        throw new BadRequestException('No hay stock registrado pa ra este producto en este almacen');
      }
      ap = almacenProductoRepo.create({
        almacen, producto, cantidad_actual: cantidad, fecha_actualizacion: new Date()
      })
    }else{

      if(tipo_movimiento === 'ingreso' || tipo_movimiento === 'devolucion'){
        ap.cantidad_actual = ap.cantidad_actual + cantidad
      }else if(tipo_movimiento === 'salida'){
        if(ap.cantidad_actual < cantidad){
          throw new BadRequestException('Stock insuficiente para la salida');
        }
        ap.cantidad_actual = ap.cantidad_actual - cantidad;
      }
      ap.fecha_actualizacion = new Date();
    }

    await almacenProductoRepo.save(ap);
    
  }
}
