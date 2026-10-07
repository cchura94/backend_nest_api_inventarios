import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Clienteproveedor } from "../../clienteproveedor/entities/clienteproveedor.entity.js";
import { User } from "../../users/entities/user.entity.js";
import { Movimiento } from "./movimiento.entity.js";

@Entity('notas')
export class Nota {

    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    fecha: Date;

    @Column()
    tipo_nota: 'compra' | 'venta' | 'devolucion'

    @ManyToOne(() => Clienteproveedor, {eager: true})
    clienteproveedor: Clienteproveedor;

    @ManyToOne(() => User, {eager: true})
    user: User

    @Column({ length: 50})
    estado_nota: string;

    @Column()
    observaciones: string;

    @OneToMany(() => Movimiento, mov => mov.nota)
    movimientos: Movimiento[];

}
