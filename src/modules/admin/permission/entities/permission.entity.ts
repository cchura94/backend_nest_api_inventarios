import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../../role/entities/role.entity.js";

@Entity()
export class Permission {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({nullable: true})
    label: string;

    @Column()
    action: string;

    @Column()
    subject: string;

    @ManyToMany(() => Role, (role) => role.permissions)
    roles: Role[]

}
