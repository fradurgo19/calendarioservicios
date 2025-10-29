import express from 'express';
import pool from '../config/database.ts';
import { authenticateToken } from '../middleware/auth.ts';
import type { AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

router.use(authenticateToken);

// GET /api/service-entries - Listar entradas de servicio
router.get('/', async (req: AuthRequest, res: express.Response) => {
  try {
    const { sede_id, estado } = req.query;
    
    let query = `
      SELECT se.*, s.nombre as sede_nombre, s.codigo as sede_codigo
      FROM service_entries se
      LEFT JOIN sedes s ON se.sede_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;
    
    if (sede_id) {
      query += ` AND se.sede_id = $${paramCount}`;
      params.push(sede_id);
      paramCount++;
    }
    
    if (estado) {
      query += ` AND se.estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }
    
    query += ' ORDER BY se.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error al obtener service entries:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/service-entries/:id
router.get('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT se.*, s.nombre as sede_nombre, s.codigo as sede_codigo
       FROM service_entries se
       LEFT JOIN sedes s ON se.sede_id = s.id
       WHERE se.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entrada no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al obtener service entry:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/service-entries - Crear entrada
router.post('/', async (req: AuthRequest, res: express.Response) => {
  try {
    const {
      site,
      zone,
      ott,
      client,
      advisor,
      type,
      equipment_state,
      equipment,
      notas,
      estado = 'abierto',
      sede_id,
    } = req.body;
    
    if (!site || !zone || !ott || !client || !advisor || !type || !equipment_state) {
      return res.status(400).json({ error: 'Todos los campos requeridos deben ser proporcionados' });
    }
    
    const result = await pool.query(
      `INSERT INTO service_entries 
       (site, zone, ott, client, advisor, type, equipment_state, equipment, notas, estado, sede_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [site, zone, ott, client, advisor, type, equipment_state, equipment || null, notas || null, estado, sede_id || null, req.user!.id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al crear service entry:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

// PUT /api/service-entries/:id - Actualizar entrada
router.put('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const {
      site,
      zone,
      ott,
      client,
      advisor,
      type,
      equipment_state,
      equipment,
      notas,
      estado,
      sede_id,
    } = req.body;
    
    const result = await pool.query(
      `UPDATE service_entries
       SET site = COALESCE($1, site),
           zone = COALESCE($2, zone),
           ott = COALESCE($3, ott),
           client = COALESCE($4, client),
           advisor = COALESCE($5, advisor),
           type = COALESCE($6, type),
           equipment_state = COALESCE($7, equipment_state),
           equipment = COALESCE($8, equipment),
           notas = COALESCE($9, notas),
           estado = COALESCE($10, estado),
           sede_id = COALESCE($11, sede_id),
           updated_at = NOW()
       WHERE id = $12
       RETURNING *`,
      [site, zone, ott, client, advisor, type, equipment_state, equipment, notas, estado, sede_id, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entrada no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al actualizar service entry:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/service-entries/:id
router.delete('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM service_entries WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entrada no encontrada' });
    }
    
    res.json({ message: 'Entrada eliminada correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar service entry:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

