import express from 'express';
import pool from '../config/database.ts';
import { authenticateToken } from '../middleware/auth.ts';
import type { AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

router.use(authenticateToken);

// GET /api/pending-items - Listar items pendientes
router.get('/', async (req: AuthRequest, res: express.Response) => {
  try {
    const { sede_id, estado } = req.query;
    
    let query = 'SELECT * FROM pending_items WHERE 1=1';
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
    
    query += " ORDER BY CASE WHEN estado = 'abierto' THEN 0 ELSE 1 END, created_at DESC, date DESC";
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error al obtener pending items:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/pending-items/:id
router.get('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM pending_items WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al obtener pending item:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/pending-items - Crear item
router.post('/', async (req: AuthRequest, res: express.Response) => {
  try {
    const {
      item,
      date,
      assigned_to,
      due_date,
      estado = 'abierto',
      observations = '',
      sede_id,
    } = req.body;
    
    if (!item || !date || !assigned_to || !due_date) {
      return res.status(400).json({ error: 'Todos los campos requeridos deben ser proporcionados' });
    }
    
    const result = await pool.query(
      `INSERT INTO pending_items 
       (item, date, assigned_to, due_date, estado, observations, sede_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [item, date, assigned_to, due_date, estado, observations, sede_id || null, req.user!.id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al crear pending item:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/pending-items/:id
router.put('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const {
      item,
      date,
      assigned_to,
      due_date,
      estado,
      observations,
      sede_id,
    } = req.body;
    
    const result = await pool.query(
      `UPDATE pending_items
       SET item = COALESCE($1, item),
           date = COALESCE($2, date),
           assigned_to = COALESCE($3, assigned_to),
           due_date = COALESCE($4, due_date),
           estado = COALESCE($5, estado),
           observations = COALESCE($6, observations),
           sede_id = COALESCE($7, sede_id),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [item, date, assigned_to, due_date, estado, observations, sede_id, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al actualizar pending item:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/pending-items/:id
router.delete('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM pending_items WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    
    res.json({ message: 'Item eliminado correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar pending item:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

