import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AlmacenProducto } from "./almacen_producto.entity.js";
import { Sucursal } from "../../sucursal/entities/sucursal.entity.js";

@Entity()
export class Almacen {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 100})
    nombre: string;

    @Column({length: 100, nullable: true})
    codigo: string;

    @Column({type: 'text', nullable: true})
    descripcion: string;

    
    @ManyToOne(() => Sucursal, suc=> suc.almacenes, {eager: true})
    sucursal: Sucursal;
    
    @OneToMany(() => AlmacenProducto, ap=> ap.almacen)
    productos: AlmacenProducto[];
}
