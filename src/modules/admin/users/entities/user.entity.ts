import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../../role/entities/role.entity.js";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({type: 'varchar', length: 50})
    name: string;

    @Column({unique: true})
    email: string;

    @Column()
    password: string;

    @Column({default: true})
    status: boolean;

    @ManyToMany(() => Role, {eager: true})
    @JoinTable({
        name: 'users_roles',
        joinColumn: { name: 'user_id' },
        inverseJoinColumn: {name: 'role_id'}
    })
    roles: Role[]
}
