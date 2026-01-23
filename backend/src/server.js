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

dotenv.config();

// Criar usuário admin automaticamente se não existir
async function ensureAdminUser() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@exemplo.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
    
    if (!existingUser) {
      console.log('👤 Criando usuário admin automaticamente...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(adminEmail, hashedPassword);
      console.log(`✅ Usuário admin criado: ${adminEmail}`);
      console.log(`🔑 Senha padrão: ${adminPassword}`);
      console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    } else {
      console.log(`✅ Usuário admin já existe: ${adminEmail}`);
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

