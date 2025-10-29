import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, 'server', '.env') });

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'calendario_servicios',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

console.log('Intentando conectar a la base de datos...');
console.log('Configuración:', {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  database: process.env.DB_NAME || 'calendario_servicios',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD ? '***' : '(vacío)',
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error de conexión:', err.message);
    console.error('\n💡 Asegúrate de:');
    console.error('   1. PostgreSQL está ejecutándose');
    console.error('   2. La base de datos "calendario_servicios" existe');
    console.error('   3. El usuario y contraseña son correctos en server/.env');
    process.exit(1);
  } else {
    console.log('✅ Conexión exitosa a la base de datos!');
    console.log('Fecha/hora del servidor:', res.rows[0].now);
    pool.end();
  }
});

