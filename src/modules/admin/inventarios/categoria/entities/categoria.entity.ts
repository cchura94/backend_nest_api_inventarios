import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Producto } from "../../producto/entities/producto.entity.js";

@Entity('categorias')
export class Categoria {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({type: 'text', nullable: true})
    descripcion: string;

    @OneToMany(() => Producto, prod => prod.categoria)
    productos: Producto[]
}
