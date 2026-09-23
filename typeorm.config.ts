import { DataSource } from "typeorm";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default new DataSource({
    type: 'postgres',
    host: process.env.BD_HOST,
    port: Number(process.env.BD_PORT) || 5432,
    username: process.env.BD_USERNAME,
    password: process.env.BD_PASSWORD,
    database: process.env.BD_DATABASE,
    entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/src/database/migrations/*{.ts,.js}'],
    synchronize: false
})