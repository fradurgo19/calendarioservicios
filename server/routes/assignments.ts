import express from 'express';
import pool from '../config/database.ts';
import { authenticateToken } from '../middleware/auth.ts';
import type { AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

router.use(authenticateToken);

// GET /api/assignments - Listar asignaciones
router.get('/', async (req: AuthRequest, res: express.Response) => {
  try {
    const result = await pool.query('SELECT * FROM assignments ORDER BY date ASC');
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error al obtener assignments:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/assignments - Crear asignación
router.post('/', async (req: AuthRequest, res: express.Response) => {
  try {
    const { service_entry_id, resource_id, date } = req.body;
    
    if (!service_entry_id || !resource_id || !date) {
      return res.status(400).json({ error: 'service_entry_id, resource_id y date son requeridos' });
    }
    
    // Validar que los IDs sean UUIDs válidos
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(service_entry_id)) {
      return res.status(400).json({ error: 'service_entry_id no es un UUID válido: ' + service_entry_id });
    }
    if (!uuidRegex.test(resource_id)) {
      return res.status(400).json({ error: 'resource_id no es un UUID válido: ' + resource_id });
    }
    
    const result = await pool.query(
      `INSERT INTO assignments (service_entry_id, resource_id, date)
       VALUES ($1, $2, $3)
       ON CONFLICT (service_entry_id, resource_id, date) DO NOTHING
       RETURNING *`,
      [service_entry_id, resource_id, date]
    );
    
    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'La asignación ya existe' });
    }
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al crear assignment:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/assignments/:id
router.delete('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM assignments WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }
    
    res.json({ message: 'Asignación eliminada correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar assignment:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

