import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.ts';
import sedesRoutes from './routes/sedes.ts';
import serviceEntriesRoutes from './routes/serviceEntries.ts';
import quoteEntriesRoutes from './routes/quoteEntries.ts';
import pendingItemsRoutes from './routes/pendingItems.ts';
import resourcesRoutes from './routes/resources.ts';
import assignmentsRoutes from './routes/assignments.ts';
import quoteAssignmentsRoutes from './routes/quoteAssignments.ts';

// Configurar dotenv para buscar .env en el directorio server
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', message: 'Backend está funcionando' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sedes', sedesRoutes);
app.use('/api/service-entries', serviceEntriesRoutes);
app.use('/api/quote-entries', quoteEntriesRoutes);
app.use('/api/pending-items', pendingItemsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/quote-assignments', quoteAssignmentsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

