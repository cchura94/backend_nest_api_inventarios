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
import PDFDocument from 'pdfkit'
import {Response} from 'express'

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


  async funGenerarReportePDFPorID(id: number, res: Response) {
  const nota = await this.notaRepository
    .createQueryBuilder('nota')
    .leftJoinAndSelect('nota.user', 'user')
    .leftJoinAndSelect('nota.clienteproveedor', 'clienteproveedor')
    .leftJoinAndSelect('nota.movimientos', 'movimientos')
    .leftJoinAndSelect('movimientos.producto', 'producto')
    .where('nota.id = :id', { id })
    .getOne();

  if (!nota) {
    throw new NotFoundException('La nota no existe');
  }

  const doc = new PDFDocument({
    size: 'A4',
    margins: {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40,
    },
    bufferPages: true,
    info: {
      Title: `Comprobante de ${nota.tipo_nota} N° ${nota.id}`,
      Author: 'Sistema de inventario',
    },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=comprobante_${nota.id}.pdf`,
  );

  doc.pipe(res);

  // Configuración general
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const blue = '#0B5394';
  const gray = '#F2F4F7';
  const textColor = '#333333';

  const moneda = (valor: number | string) =>
    new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(valor) || 0);

  const fecha = new Date(nota.fecha).toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // Compra: precio de compra. Venta: precio de venta.
  const movimientos = nota.movimientos ?? [];

  const items = movimientos.map((movimiento) => {
    const precioUnitario =
      nota.tipo_nota === 'compra'
        ? Number(movimiento.precio_compra)
        : Number(movimiento.precio_venta);

    const cantidad = Number(movimiento.cantidad) || 0;

    return {
      nombre: movimiento.producto?.nombre ?? 'Producto sin nombre',
      unidad: movimiento.producto?.unidad_medida ?? '',
      cantidad,
      precioUnitario: Number.isFinite(precioUnitario)
        ? precioUnitario
        : 0,
      subtotal:
        cantidad *
        (Number.isFinite(precioUnitario) ? precioUnitario : 0),
    };
  });

  const total = items.reduce((suma, item) => suma + item.subtotal, 0);

  // Encabezado del comprobante
  const dibujarEncabezado = () => {
    doc
      .font('Helvetica-Bold')
      .fontSize(22)
      .fillColor(blue)
      .text('COMPROBANTE', margin, 40, {
        width: contentWidth,
        align: 'center',
      });

    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor(textColor)
      .text(
        nota.tipo_nota === 'compra'
          ? 'COMPROBANTE DE COMPRA'
          : 'COMPROBANTE DE VENTA',
        margin,
        72,
        { width: contentWidth, align: 'center' },
      );

    doc
      .moveTo(margin, 98)
      .lineTo(pageWidth - margin, 98)
      .strokeColor(blue)
      .lineWidth(1.5)
      .stroke();

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(textColor)
      .text(`N.º de comprobante: ${nota.id}`, margin, 110);

    doc
      .font('Helvetica')
      .fontSize(10)
      .text(`Fecha: ${fecha}`, margin, 126);

    doc
      .font('Helvetica')
      .text(
        `Estado: ${nota.estado_nota ?? 'Sin estado'}`,
        margin,
        142,
      );

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor(blue)
      .text('DATOS DEL CLIENTE / PROVEEDOR', margin, 170);

    const persona = nota.clienteproveedor;

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(textColor)
      .text(
        `Razón social: ${persona?.razon_social ?? 'No especificado'}`,
        margin,
        190,
        { width: contentWidth },
      );

    doc.text(
      `Identificación: ${persona?.identificacion ?? 'No especificada'}`,
      margin,
      206,
      { width: contentWidth },
    );

    doc.text(
      `Dirección: ${persona?.direccion ?? 'No especificada'}`,
      margin,
      222,
      { width: contentWidth },
    );

    doc.text(
      `Teléfono: ${persona?.telefono ?? 'No especificado'}`,
      margin,
      238,
      { width: contentWidth },
    );

    doc.text(
      `Atendido por: ${nota.user?.name ?? 'No especificado'}`,
      margin,
      254,
      { width: contentWidth },
    );
  };

  // Columnas de la tabla
  const columnas = [
    { titulo: 'N.º', ancho: 30, align: 'left' as const },
    { titulo: 'Producto', ancho: 190, align: 'left' as const },
    { titulo: 'Cant.', ancho: 55, align: 'right' as const },
    { titulo: 'P. unitario', ancho: 100, align: 'right' as const },
    { titulo: 'Subtotal', ancho: 90, align: 'right' as const },
  ];

  const tableWidth = columnas.reduce(
    (suma, columna) => suma + columna.ancho,
    0,
  );

  const dibujarCabeceraTabla = (y: number) => {
    doc.rect(margin, y, tableWidth, 25).fill(blue);

    let x = margin;

    columnas.forEach((columna) => {
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#FFFFFF')
        .text(columna.titulo, x + 4, y + 8, {
          width: columna.ancho - 8,
          align: columna.align,
        });

      x += columna.ancho;
    });

    return y + 25;
  };

  dibujarEncabezado();

  let y = dibujarCabeceraTabla(285);

  // Filas de productos
  items.forEach((item, index) => {
    const nombre = item.unidad
      ? `${item.nombre} (${item.unidad})`
      : item.nombre;

    const alturaNombre = doc
      .font('Helvetica')
      .fontSize(9)
      .heightOfString(nombre, {
        width: columnas[1].ancho - 8,
      });

    const rowHeight = Math.max(25, alturaNombre + 12);

    // Salto de página si la fila no cabe
    if (y + rowHeight > pageHeight - 100) {
      doc.addPage();
      y = 45;
      y = dibujarCabeceraTabla(y);
    }

    if (index % 2 === 0) {
      doc.rect(margin, y, tableWidth, rowHeight).fill(gray);
    }

    let x = margin;

    const valores = [
      String(index + 1),
      nombre,
      moneda(item.cantidad),
      moneda(item.precioUnitario),
      moneda(item.subtotal),
    ];

    doc.fillColor(textColor);

    columnas.forEach((columna, i) => {
      doc
        .font('Helvetica')
        .fontSize(9)
        .text(valores[i], x + 4, y + 6, {
          width: columna.ancho - 8,
          align: columna.align,
          height: rowHeight - 8,
        });

      x += columna.ancho;
    });

    doc
      .moveTo(margin, y + rowHeight)
      .lineTo(margin + tableWidth, y + rowHeight)
      .strokeColor('#D9DEE5')
      .lineWidth(0.5)
      .stroke();

    y += rowHeight;
  });

  // Espacio para el total; crear otra página si hace falta
  if (y + 65 > pageHeight - 40) {
    doc.addPage();
    y = 45;
  }

  y += 15;

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor(blue)
    .text('TOTAL GENERAL:', margin, y, {
      width: tableWidth - 110,
      align: 'right',
    });

  doc.text(`Bs ${moneda(total)}`, margin + tableWidth - 105, y, {
    width: 105,
    align: 'right',
  });

  y += 35;

  // Observaciones
  const observaciones = nota.observaciones?.trim();

  if (observaciones) {
    if (y + 65 > pageHeight - 40) {
      doc.addPage();
      y = 45;
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(blue)
      .text('OBSERVACIONES', margin, y);

    y += 16;

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(textColor)
      .text(observaciones, margin, y, {
        width: contentWidth,
      });

    y = doc.y + 25;
  }

  // Firmas
  if (y + 65 > pageHeight - 40) {
    doc.addPage();
    y = 45;
  }

  y += 30;

  const firmaWidth = 180;
  const firmaDerecha = pageWidth - margin - firmaWidth;

  doc
    .moveTo(margin, y + 25)
    .lineTo(margin + firmaWidth, y + 25)
    .strokeColor('#777777')
    .stroke();

  doc
    .moveTo(firmaDerecha, y + 25)
    .lineTo(firmaDerecha + firmaWidth, y + 25)
    .stroke();

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(textColor)
    .text('Entregado por', margin, y + 31, {
      width: firmaWidth,
      align: 'center',
    });

  doc.text('Recibido por', firmaDerecha, y + 31, {
    width: firmaWidth,
    align: 'center',
  });

  // Numeración de todas las páginas
  const rangoPaginas = doc.bufferedPageRange();

  for (
    let pagina = rangoPaginas.start;
    pagina < rangoPaginas.start + rangoPaginas.count;
    pagina++
  ) {
    doc.switchToPage(pagina);

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#777777')
      .text(
        `Comprobante N.º ${nota.id} | Página ${pagina + 1} de ${rangoPaginas.count}`,
        margin,
        pageHeight - 28,
        {
          width: contentWidth,
          align: 'center',
          lineBreak: false,
        },
      );
  }

  doc.end();
}

}
