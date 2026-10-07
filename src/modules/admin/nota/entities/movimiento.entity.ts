import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { Nota } from "./nota.entity.js";
import { Producto } from "../../inventarios/producto/entities/producto.entity.js";
import { Almacen } from "../../inventarios/almacen/entities/almacen.entity.js";

@Entity('movimientos')
export class Movimiento{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne("Nota", "movimientos")
    nota: Nota;

    @ManyToOne(() => Producto, {eager: true})
    producto: Producto;

    @ManyToOne(() => Almacen, {eager: true})
    almacen: Almacen;

    @Column({type: 'int'})
    cantidad: number;

    @Column({type: 'varchar', length: 20})
    tipo_movimiento: 'ingreso' | 'salida' | 'devolucion'

    @Column({type: 'decimal', precision: 12, scale: 2})
    precio_compra: number;

    @Column({type: 'decimal', precision: 12, scale: 2})
    precio_venta: number;

    @Column({type: 'text', nullable: true})
    observaciones: string;


}