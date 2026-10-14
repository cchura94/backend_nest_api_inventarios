import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotaDto } from './dto/create-nota.dto.js';
import { UpdateNotaDto } from './dto/update-nota.dto.js';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Clienteproveedor } from '../clienteproveedor/entities/clienteproveedor.entity.js';
import { Nota } from './entities/nota.entity.js';
import { Producto } from '../inventarios/producto/entities/producto.entity.js';
import { Almacen } from '../inventarios/almacen/entities/almacen.entity.js';
import { Movimiento } from './entities/movimiento.entity.js';
import type { QueryRunner } from 'typeorm';
import { AlmacenProducto } from '../inventarios/almacen/entities/almacen_producto.entity.js';

@Injectable()
export class NotaService {

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectRepository(Nota)
    private notaRepository: Repository<Nota>,
  ){}

  async create(createNotaDto: CreateNotaDto, user_sesion: any) {
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
      const user = await userRepo.findOneBy({id: user_sesion.sub})
      if(!user){
        throw new NotFoundException('User no encontrado');
      }
      // Crear Nota
      const nota = await notaRepo.create({
        ...createNotaDto,
        fecha: new Date(),
        user: user,
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

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    tipo_nota?: string,
    estado_nota?: string,
    clienteproveedor_id?: number,
    fecha_inicio?: string,
    fecha_fin?: string,
  ) {
    const queryBuilder = this.notaRepository
      .createQueryBuilder('nota')
      .leftJoinAndSelect('nota.clienteproveedor', 'clienteproveedor')
      .leftJoinAndSelect('nota.user', 'user')
      .leftJoinAndSelect('nota.movimientos', 'movimiento')
      .leftJoinAndSelect('movimiento.producto', 'producto')
      .leftJoinAndSelect('movimiento.almacen', 'almacen')
      .orderBy('nota.id', 'DESC');

    if (search) {
      queryBuilder.andWhere(
        '(nota.observaciones ILIKE :search OR clienteproveedor.razon_social ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (tipo_nota) {
      queryBuilder.andWhere('nota.tipo_nota = :tipo_nota', { tipo_nota });
    }

    if (estado_nota) {
      queryBuilder.andWhere('nota.estado_nota = :estado_nota', { estado_nota });
    }

    if (clienteproveedor_id) {
      queryBuilder.andWhere('clienteproveedor.id = :clienteproveedor_id', {
        clienteproveedor_id,
      });
    }

    if (fecha_inicio && fecha_fin) {
      queryBuilder.andWhere('nota.fecha BETWEEN :fecha_inicio AND :fecha_fin', {
        fecha_inicio: new Date(`${fecha_inicio}T00:00:00`),
        fecha_fin: new Date(`${fecha_fin}T23:59:59`),
      });
    } else if (fecha_inicio) {
      queryBuilder.andWhere('nota.fecha >= :fecha_inicio', {
        fecha_inicio: new Date(`${fecha_inicio}T00:00:00`),
      });
    } else if (fecha_fin) {
      queryBuilder.andWhere('nota.fecha <= :fecha_fin', {
        fecha_fin: new Date(`${fecha_fin}T23:59:59`),
      });
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      limit,
      page,
      totalPages,
      search,
      tipo_nota,
      estado_nota,
      clienteproveedor_id,
      fecha_inicio,
      fecha_fin,
    };
  }

  async findOne(id: number) {
    const nota = await this.notaRepository.findOne({
      where: { id },
      relations: { movimientos: { producto: true, almacen: true } },
    });

    if(!nota) throw new NotFoundException('La nota no existe');
    return nota;
  }

  async update(id: number, updateNotaDto: UpdateNotaDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const notaRepo = queryRunner.manager.getRepository(Nota);
      const clieProvRep = queryRunner.manager.getRepository(Clienteproveedor);
      const productoRepo = queryRunner.manager.getRepository(Producto);
      const almacenRepo = queryRunner.manager.getRepository(Almacen);
      const movimientoRepo = queryRunner.manager.getRepository(Movimiento);

      const nota = await notaRepo.findOne({
        where: { id },
        relations: { movimientos: { producto: true, almacen: true } },
      });
      if(!nota) throw new NotFoundException('La nota no existe');

      const { movimientos, clienteproveedor_id, ...datos } = updateNotaDto;

      if(clienteproveedor_id !== undefined){
        const clienteproveedor = await clieProvRep.findOneBy({id: clienteproveedor_id});
        if(!clienteproveedor){
          throw new NotFoundException('Cliente/Proveedor no encontrado');
        }
        nota.clienteproveedor = clienteproveedor;
      }

      // Si se envían movimientos, se reemplazan y se ajusta el stock
      if(movimientos !== undefined){
        // revertir el stock de los movimientos anteriores
        for(const anterior of nota.movimientos ?? []){
          await this.revertirStockQueryRunner(
            queryRunner, anterior.almacen, anterior.producto,
            anterior.cantidad, anterior.tipo_movimiento
          );
        }
        await movimientoRepo.remove(nota.movimientos ?? []);

        const movimientosGuardados:Movimiento[] = [];

        for(const m of movimientos){
          const producto = await productoRepo.findOneBy({id: m.producto_id});
          if(!producto) throw new NotFoundException('Producto no encontrado');

          const almacen = await almacenRepo.findOneBy({id: m.almacen_id});
          if(!almacen) throw new NotFoundException('Almacen no encontrado');

          await this.actualizarStockQueryRunner(
            queryRunner, almacen, producto, m.cantidad, m.tipo_movimiento
          );

          const movimiento = movimientoRepo.create({
            ...m, nota, producto, almacen
          });
          movimientosGuardados.push(await movimientoRepo.save(movimiento));
        }

        nota.movimientos = movimientosGuardados;
      }

      notaRepo.merge(nota, datos);
      await notaRepo.save(nota);

      await queryRunner.commitTransaction();
      return this.findOne(id);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error
    }
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const notaRepo = queryRunner.manager.getRepository(Nota);
      const movimientoRepo = queryRunner.manager.getRepository(Movimiento);

      const nota = await notaRepo.findOne({
        where: { id },
        relations: { movimientos: { producto: true, almacen: true } },
      });
      if(!nota) throw new NotFoundException('La nota no existe');

      // revertir el stock de los movimientos antes de eliminar
      for(const movimiento of nota.movimientos ?? []){
        await this.revertirStockQueryRunner(
          queryRunner, movimiento.almacen, movimiento.producto,
          movimiento.cantidad, movimiento.tipo_movimiento
        );
      }

      await movimientoRepo.remove(nota.movimientos ?? []);
      await notaRepo.remove(nota);

      await queryRunner.commitTransaction();
      return { message: 'La nota fue eliminada' };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error
    }
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

  async revertirStockQueryRunner(queryRunner:QueryRunner, almacen:Almacen, producto:Producto, cantidad: number, tipo_movimiento: 'ingreso' | 'salida' | 'devolucion'){
    const almacenProductoRepo = queryRunner.manager.getRepository(AlmacenProducto);

    const ap = await almacenProductoRepo.findOne({
      where: {
        almacen: {id: almacen.id},
        producto: {id: producto.id}
      }
    })

    if(!ap) return;

    if(tipo_movimiento === 'ingreso' || tipo_movimiento === 'devolucion'){
      ap.cantidad_actual = ap.cantidad_actual - cantidad;
    }else if(tipo_movimiento === 'salida'){
      ap.cantidad_actual = ap.cantidad_actual + cantidad;
    }
    ap.fecha_actualizacion = new Date();

    await almacenProductoRepo.save(ap);
  }
}
