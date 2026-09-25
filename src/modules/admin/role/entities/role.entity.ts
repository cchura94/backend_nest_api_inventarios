import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from "../../permission/entities/permission.entity.js";

@Entity('roles')
export class Role {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column({nullable: true})
    descripcion: string;

    @ManyToMany(() => Permission, (per) => per.roles, {eager: true})
    @JoinTable({
        name: 'role_permissions',
        joinColumn: {
            name: 'role_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'permission_id',
            referencedColumnName: 'id'
        }
    })
    permissions: Permission[]

}
