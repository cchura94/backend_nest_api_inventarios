import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}
