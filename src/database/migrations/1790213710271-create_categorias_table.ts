import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategoriasTable1790213710271 implements MigrationInterface {
    name = 'CreateCategoriasTable1790213710271'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categorias" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, "descripcion" character varying, CONSTRAINT "PK_3886a26251605c571c6b4f861fe" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "categorias"`);
    }

}
