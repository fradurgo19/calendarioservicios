import express from 'express';
import pool from '../config/database.ts';
import { authenticateToken } from '../middleware/auth.ts';
import type { AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

router.use(authenticateToken);

// GET /api/quote-assignments any - Listar asignaciones de cotizaciones
router.get('/', async (req: AuthRequest, res: express.Response) => {
  try {
    const { quote_entry_id, date, status } = req.query;
    
    let query = 'SELECT * FROM quote_assignments WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;
    
    if (quote_entry_id) {
      query += ` AND quote_entry_id = $${paramCount}`;
      params.push(quote_entry_id);
      paramCount++;
    }
    
    if (date) {
      query += ` AND date = $${paramCount}`;
      params.push(date);
      paramCount++;
    }
    
    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    query += ' ORDER BY date DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error al obtener quote assignments:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/quote-assignments - Crear o actualizar asignación
router.post('/', async (req: AuthRequest, res: express.Response) => {
  try {
    const { quote_entry_id, date, status = 'pending' } = req.body;
    
    if (!quote_entry_id || !date) {
      return res.status(400).json({ error: 'quote_entry_id y date son requeridos' });
    }
    
    // Verificar que el status sea válido
    if (status && !['scheduled', 'pending', 'delivered'].includes(status)) {
      return res.status(400).json({ error: 'status debe ser scheduled, pending o delivered' });
    }
    
    const result = await pool.query(
      `INSERT INTO quote_assignments (quote_entry_id, date, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (quote_entry_id, date) 
       DO UPDATE SET status = EXCLUDED.status
       RETURNING *`,
      [quote_entry_id, date, status]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al crear/actualizar quote assignment:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/quote-assignments/:id - Actualizar status
router.put('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['scheduled', 'pending', 'delivered'].includes(status)) {
      return res.status(400).json({ error: 'status debe ser scheduled, pending o delivered' });
    }
    
    const result = await pool.query(
      `UPDATE quote_assignments
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al actualizar quote assignment:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/quote-assignments/:id
router.delete('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM quote_assignments WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }
    
    res.json({ message: 'Asignación eliminada correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar quote assignment:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

