import express from 'express';
import pool from '../config/database.ts';
import { authenticateToken } from '../middleware/auth.ts';
import type { AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

router.use(authenticateToken);

// GET /api/resources - Listar recursos
router.get('/', async (req: AuthRequest, res: express.Response) => {
  try {
    const { sede_id, type } = req.query;
    
    let query = 'SELECT * FROM resources WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;
    
    // Si hay sede_id, incluir recursos de esa sede o fases (globales)
    if (sede_id) {
      query += ` AND (sede_id = $${paramCount} OR type = 'phase')`;
      params.push(sede_id);
      paramCount++;
    }
    
    if (type) {
      query += ` AND type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }
    
    query += ' ORDER BY type, name';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error al obtener resources:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/resources/:id
router.get('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM resources WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al obtener resource:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/resources - Crear recurso
router.post('/', async (req: AuthRequest, res: express.Response) => {
  try {
    const { name, type, available = true, sede_id } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name y type son requeridos' });
    }
    
    // Las fases no tienen sede_id
    const finalSedeId = type === 'phase' ? null : (sede_id || null);
    
    const result = await pool.query(
      `INSERT INTO resources (name, type, available, sede_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, type, available, finalSedeId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al crear resource:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/resources/:id
router.put('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const { name, type, available, sede_id } = req.body;
    
    // Obtener el recurso actual
    const current = await pool.query('SELECT type, sede_id FROM resources WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }
    
    const currentType = current.rows[0].type;
    const currentSedeId = current.rows[0].sede_id;
    const finalType = type || currentType;
    
    // Determinar el sede_id final
    let finalSedeId: string | null;
    if (finalType === 'phase') {
      // Las fases siempre tienen sede_id = null
      finalSedeId = null;
    } else {
      // Para otros tipos
      if (sede_id !== undefined) {
        // Si se proporciona sede_id, usarlo (puede ser null)
        finalSedeId = sede_id || null;
      } else {
        // Si no se proporciona, mantener el actual
        finalSedeId = currentSedeId;
      }
    }
    
    const result = await pool.query(
      `UPDATE resources
       SET name = COALESCE($1, name),
           type = COALESCE($2, type),
           available = COALESCE($3, available),
           sede_id = $4
       WHERE id = $5
       RETURNING *`,
      [name || null, type || null, available !== undefined ? available : null, finalSedeId, id]
    );
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al actualizar resource:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// DELETE /api/resources/:id
router.delete('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM resources WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }
    
    res.json({ message: 'Recurso eliminado correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar resource:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

