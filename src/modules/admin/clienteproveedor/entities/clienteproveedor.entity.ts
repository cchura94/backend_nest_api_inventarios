import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('clienteproveedor')
export class Clienteproveedor {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    tipo: 'cliente' | 'proveedor';

    @Column()
    razon_social: string;

    @Column({length: 100, nullable: true})
    identificacion: string;

    @Column({length: 255, nullable: true})
    direccion: string;

    @Column({length: 20, nullable: true})
    telefono: string;

    @Column({length: 200, nullable: true})
    correo: string;

    @Column()
    estado: boolean;
}
