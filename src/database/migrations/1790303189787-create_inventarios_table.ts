import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInventariosTable1790303189787 implements MigrationInterface {
    name = 'CreateInventariosTable1790303189787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "productos" ("id" SERIAL NOT NULL, "nombre" character varying(200) NOT NULL, "descripcion" text NOT NULL, "codigo_barra" character varying, "unidad_medida" character varying, "marca" character varying, "precio_venta_actual" numeric(12,2) NOT NULL, "imagen" character varying(255), "estado" boolean NOT NULL, "categoriaId" integer, CONSTRAINT "PK_04f604609a0949a7f3b43400766" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "almacen_producto" ("id" SERIAL NOT NULL, "cantidad_actual" integer NOT NULL, "fecha_actualizacion" date NOT NULL, "almacenId" integer, "productoId" integer, CONSTRAINT "PK_d012ea8045175d18843e998dea7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sucursales" ("id" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, "direccion" character varying(255) NOT NULL, "telefono" character varying(22) NOT NULL, "ciudad" character varying(255) NOT NULL, CONSTRAINT "PK_c2232960c9e458db5b18d35eeba" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "almacen" ("id" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, "codigo" character varying(100), "descripcion" text, "sucursalId" integer, CONSTRAINT "PK_78a1ec4675cb911ff041d485b3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "categorias" DROP COLUMN "descripcion"`);
        await queryRunner.query(`ALTER TABLE "categorias" ADD "descripcion" text`);
        await queryRunner.query(`ALTER TABLE "productos" ADD CONSTRAINT "FK_aee00189e42dd8880cdfe1bb1e7" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "almacen_producto" ADD CONSTRAINT "FK_696fa0d027c3bfd994ab1b8ecaa" FOREIGN KEY ("almacenId") REFERENCES "almacen"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "almacen_producto" ADD CONSTRAINT "FK_87fdbb2b70a59565ceca5e2a428" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "almacen" ADD CONSTRAINT "FK_e314656bc172380d00921109fa4" FOREIGN KEY ("sucursalId") REFERENCES "sucursales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "almacen" DROP CONSTRAINT "FK_e314656bc172380d00921109fa4"`);
        await queryRunner.query(`ALTER TABLE "almacen_producto" DROP CONSTRAINT "FK_87fdbb2b70a59565ceca5e2a428"`);
        await queryRunner.query(`ALTER TABLE "almacen_producto" DROP CONSTRAINT "FK_696fa0d027c3bfd994ab1b8ecaa"`);
        await queryRunner.query(`ALTER TABLE "productos" DROP CONSTRAINT "FK_aee00189e42dd8880cdfe1bb1e7"`);
        await queryRunner.query(`ALTER TABLE "categorias" DROP COLUMN "descripcion"`);
        await queryRunner.query(`ALTER TABLE "categorias" ADD "descripcion" character varying`);
        await queryRunner.query(`DROP TABLE "almacen"`);
        await queryRunner.query(`DROP TABLE "sucursales"`);
        await queryRunner.query(`DROP TABLE "almacen_producto"`);
        await queryRunner.query(`DROP TABLE "productos"`);
    }

}
