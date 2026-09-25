import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Producto } from "../../producto/entities/producto.entity.js";
import type { Almacen } from "./almacen.entity.js";

@Entity("almacen_producto")
export class AlmacenProducto{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'int'})
    cantidad_actual: number;

    @Column({type: 'date'})
    fecha_actualizacion: Date;

    @ManyToOne("Almacen", "productos", {eager: true})
    almacen: Almacen;

    @ManyToOne(() => Producto, prod => prod.almacenes, {eager: true})
    producto: Producto;
}