import express from 'express';
import pool from '../config/database.ts';
import { authenticateToken } from '../middleware/auth.ts';
import type { AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

router.use(authenticateToken);

// GET /api/quote-entries - Listar cotizaciones
router.get('/', async (req: AuthRequest, res: express.Response) => {
  try {
    const { sede_id, estado } = req.query;
    
    let query = 'SELECT * FROM quote_entries WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;
    
    if (sede_id) {
      query += ` AND sede_id = $${paramCount}`;
      params.push(sede_id);
      paramCount++;
    }
    
    if (estado) {
      query += ` AND estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error al obtener quote entries:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/quote-entries/:id
router.get('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM quote_entries WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al obtener quote entry:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/quote-entries - Crear cotización
router.post('/', async (req: AuthRequest, res: express.Response) => {
  try {
    const { zone, equipment, client, notes, estado = 'abierto', sede_id } = req.body;
    
    if (!zone || !equipment || !client) {
      return res.status(400).json({ error: 'Zone, equipment y client son requeridos' });
    }
    
    const result = await pool.query(
      `INSERT INTO quote_entries (zone, equipment, client, notes, estado, sede_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [zone, equipment, client, notes || '', estado, sede_id || null, req.user!.id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al crear quote entry:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/quote-entries/:id
router.put('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const { zone, equipment, client, notes, estado, sede_id } = req.body;
    
    const result = await pool.query(
      `UPDATE quote_entries
       SET zone = COALESCE($1, zone),
           equipment = COALESCE($2, equipment),
           client = COALESCE($3, client),
           notes = COALESCE($4, notes),
           estado = COALESCE($5, estado),
           sede_id = COALESCE($6, sede_id),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [zone, equipment, client, notes, estado, sede_id, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al actualizar quote entry:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/quote-entries/:id
router.delete('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM quote_entries WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    res.json({ message: 'Cotización eliminada correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar quote entry:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

