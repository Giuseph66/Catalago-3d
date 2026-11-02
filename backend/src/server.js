import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import db from './config/database.js';

// Importar rotas
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import testimonialRoutes from './routes/testimonials.js';
import mediaRoutes from './routes/media.js';
import configRoutes from './routes/config.js';
import filamentRoutes from './routes/filaments.js';
import queueRoutes from './routes/queue.js';
import libraryRoutes from './routes/library.js';

dotenv.config();

// Criar usuário admin automaticamente se não existir
async function ensureAdminUser() {
  try {
    const adminName = process.env.ADMIN_NAME || 'Administrador';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@exemplo.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const normalizedEmail = adminEmail.trim().toLowerCase();
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);

    if (!existingUser) {
      console.log('👤 Criando usuário admin automaticamente...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      db.prepare('INSERT INTO users (nome, email, password, isActive) VALUES (?, ?, ?, 1)')
        .run(adminName, normalizedEmail, hashedPassword);
      console.log(`✅ Usuário admin criado: ${normalizedEmail}`);
      console.log(`🔑 Senha padrão: ${adminPassword}`);
      console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    } else {
      db.prepare(`
        UPDATE users
        SET nome = CASE WHEN nome IS NULL OR TRIM(nome) = '' THEN ? ELSE nome END,
            isActive = 1,
            updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(adminName, existingUser.id);

      console.log(`✅ Usuário admin já existe: ${normalizedEmail}`);
    }
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Importante em produção atrás de proxy (Nginx/Cloudflare/Render/etc):
// garante que req.protocol reflita X-Forwarded-Proto (https)
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/products', mediaRoutes); // Mídias devem vir ANTES das rotas de produtos para evitar conflitos
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/config', configRoutes);
app.use('/api/filaments', filamentRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/library', libraryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor'
  });
});

// Inicializar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📁 Uploads em: ${uploadDir}`);
  console.log(`💾 Banco de dados: ${process.env.DB_PATH || './database.sqlite'}`);

  // Garantir que o usuário admin existe
  await ensureAdminUser();
});
