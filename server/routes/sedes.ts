import express from 'express';
import pool from '../config/database.ts';
import { authenticateToken } from '../middleware/auth.ts';
import type { AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// GET /api/sedes - Listar todas las sedes
router.get('/', async (req: AuthRequest, res: express.Response) => {
  try {
    const { activa } = req.query;
    
    let query = 'SELECT * FROM sedes';
    const params: any[] = [];
    
    if (activa !== undefined) {
      query += ' WHERE activa = $1';
      params.push(activa === 'true');
    }
    
    query += ' ORDER BY nombre ASC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error al obtener sedes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/sedes/:id - Obtener una sede por ID
router.get('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM sedes WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sede no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al obtener sede:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/sedes - Crear una nueva sede
router.post('/', async (req: AuthRequest, res: express.Response) => {
  try {
    const { nombre, codigo, ciudad, direccion, activa = true } = req.body;
    
    if (!nombre || !codigo) {
      return res.status(400).json({ error: 'Nombre y código son requeridos' });
    }
    
    const result = await pool.query(
      `INSERT INTO sedes (nombre, codigo, ciudad, direccion, activa)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nombre, codigo, ciudad || null, direccion || null, activa]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'El código de la sede ya existe' });
    }
    console.error('Error al crear sede:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/sedes/:id - Actualizar una sede
router.put('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const { nombre, codigo, ciudad, direccion, activa } = req.body;
    
    const result = await pool.query(
      `UPDATE sedes
       SET nombre = COALESCE($1, nombre),
           codigo = COALESCE($2, codigo),
           ciudad = COALESCE($3, ciudad),
           direccion = COALESCE($4, direccion),
           activa = COALESCE($5, activa),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [nombre, codigo, ciudad, direccion, activa, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sede no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El código de la sede ya existe' });
    }
    console.error('Error al actualizar sede:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/sedes/:id - Eliminar una sede
router.delete('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM sedes WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sede no encontrada' });
    }
    
    res.json({ message: 'Sede eliminada correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar sede:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

