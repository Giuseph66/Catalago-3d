import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');
const db = new Database(dbPath);

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

// Criar tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icone TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    descricaoCurta TEXT,
    descricaoCompleta TEXT,
    peso INTEGER NOT NULL,
    altura REAL,
    largura REAL,
    profundidade REAL,
    material TEXT,
    cor TEXT,
    preco REAL,
    categorias TEXT DEFAULT '[]',
    tags TEXT DEFAULT '[]',
    status TEXT DEFAULT 'PRONTA_ENTREGA',
    destaque INTEGER DEFAULT 0,
    linkMercadoLivre TEXT,
    mensagemWhatsAppTemplate TEXT,
    historiaTitulo TEXT,
    historiaTexto TEXT,
    historiaMidia TEXT DEFAULT '[]',
    stlLink TEXT,
    views INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produtoId INTEGER NOT NULL,
    url TEXT NOT NULL,
    tipo TEXT NOT NULL,
    ordem INTEGER DEFAULT 0,
    isCapa INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produtoId) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cidade TEXT,
    texto TEXT NOT NULL,
    nota INTEGER,
    fotoUrl TEXT,
    produtoId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produtoId) REFERENCES products(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chave TEXT UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS filaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cor TEXT,
    pesoTotal REAL NOT NULL,
    pesoUsado REAL DEFAULT 0,
    custoPorGrama REAL NOT NULL,
    precoPago REAL,
    pesoCarretel REAL,
    quantidadeCarreteis INTEGER DEFAULT 1,
    status TEXT DEFAULT 'Disponivel',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS print_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identificador TEXT,
    produtoId INTEGER NOT NULL,
    filamentoId INTEGER,
    clienteNome TEXT,
    clienteContato TEXT,
    etapaCliente TEXT DEFAULT 'NOVO_PEDIDO',
    quantidadeTotal INTEGER NOT NULL DEFAULT 1,
    quantidadeImpressa INTEGER NOT NULL DEFAULT 0,
    quantidadeFalha INTEGER NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'FILA',
    prioridade INTEGER DEFAULT 1,
    posicao INTEGER DEFAULT 0,
    tempoEstimadoMinutos INTEGER,
    observacoes TEXT,
    dataInicio DATETIME,
    dataConclusao DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produtoId) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (filamentoId) REFERENCES filaments(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS print_job_materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    printJobId INTEGER NOT NULL,
    filamentoId INTEGER NOT NULL,
    pesoGasto REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (printJobId) REFERENCES print_jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (filamentoId) REFERENCES filaments(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
  CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
  CREATE INDEX IF NOT EXISTS idx_products_destaque ON products(destaque);
  CREATE INDEX IF NOT EXISTS idx_media_produtoId ON media(produtoId);
  CREATE INDEX IF NOT EXISTS idx_testimonials_produtoId ON testimonials(produtoId);
  CREATE INDEX IF NOT EXISTS idx_print_jobs_produtoId ON print_jobs(produtoId);
  CREATE INDEX IF NOT EXISTS idx_print_jobs_filamentoId ON print_jobs(filamentoId);
  CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON print_jobs(status);
`);

// Migration: Adicionar campos de usuários se não existirem
try {
  const usersTableInfo = db.prepare('PRAGMA table_info(users)').all();
  const userColumnNames = usersTableInfo.map((col) => col.name);

  if (!userColumnNames.includes('nome')) {
    db.exec('ALTER TABLE users ADD COLUMN nome TEXT');
  }
  if (!userColumnNames.includes('isActive')) {
    db.exec('ALTER TABLE users ADD COLUMN isActive INTEGER DEFAULT 1');
  }
  if (!userColumnNames.includes('updatedAt')) {
    db.exec('ALTER TABLE users ADD COLUMN updatedAt DATETIME');
  }

  db.exec(`
    UPDATE users SET isActive = 1 WHERE isActive IS NULL;
    UPDATE users SET nome = email WHERE nome IS NULL OR TRIM(nome) = '';
    UPDATE users SET updatedAt = createdAt WHERE updatedAt IS NULL;
  `);
} catch (error) {
  console.error('Erro ao executar migration de users:', error);
}

// Migration: Adicionar novos campos de características se não existirem
try {
  const tableInfo = db.prepare("PRAGMA table_info(products)").all();
  const columnNames = tableInfo.map(col => col.name);

  if (!columnNames.includes('altura')) {
    db.exec('ALTER TABLE products ADD COLUMN altura REAL');
  }
  if (!columnNames.includes('largura')) {
    db.exec('ALTER TABLE products ADD COLUMN largura REAL');
  }
  if (!columnNames.includes('profundidade')) {
    db.exec('ALTER TABLE products ADD COLUMN profundidade REAL');
  }
  if (!columnNames.includes('material')) {
    db.exec('ALTER TABLE products ADD COLUMN material TEXT');
  }
  if (!columnNames.includes('cor')) {
    db.exec('ALTER TABLE products ADD COLUMN cor TEXT');
  }
  if (!columnNames.includes('stlLink')) {
    db.exec('ALTER TABLE products ADD COLUMN stlLink TEXT');
  }

  // Migration for print_jobs reordering
  const printJobsInfo = db.prepare("PRAGMA table_info(print_jobs)").all();
  const printJobsColumnNames = printJobsInfo.map(col => col.name);
  if (!printJobsColumnNames.includes('posicao')) {
    db.exec('ALTER TABLE print_jobs ADD COLUMN posicao INTEGER DEFAULT 0');
    // Initializing posicao with id to maintain current order
    db.exec('UPDATE print_jobs SET posicao = id WHERE posicao = 0 OR posicao IS NULL');
  }
  if (!printJobsColumnNames.includes('identificador')) {
    db.exec('ALTER TABLE print_jobs ADD COLUMN identificador TEXT');
  }
  if (!printJobsColumnNames.includes('clienteNome')) {
    db.exec('ALTER TABLE print_jobs ADD COLUMN clienteNome TEXT');
  }
  if (!printJobsColumnNames.includes('clienteContato')) {
    db.exec('ALTER TABLE print_jobs ADD COLUMN clienteContato TEXT');
  }
  if (!printJobsColumnNames.includes('etapaCliente')) {
    db.exec("ALTER TABLE print_jobs ADD COLUMN etapaCliente TEXT DEFAULT 'NOVO_PEDIDO'");
  }
  if (!printJobsColumnNames.includes('quantidadeFalha')) {
    db.exec('ALTER TABLE print_jobs ADD COLUMN quantidadeFalha INTEGER NOT NULL DEFAULT 0');
  }
  if (!printJobsColumnNames.includes('observacoes')) {
    db.exec('ALTER TABLE print_jobs ADD COLUMN observacoes TEXT');
  }

  db.exec(`
    UPDATE print_jobs
    SET identificador = 'JOB-' || printf('%06d', id)
    WHERE identificador IS NULL OR TRIM(identificador) = '';

    UPDATE print_jobs
    SET etapaCliente = 'NOVO_PEDIDO'
    WHERE etapaCliente IS NULL OR TRIM(etapaCliente) = '';

    UPDATE print_jobs
    SET quantidadeFalha = 0
    WHERE quantidadeFalha IS NULL;
  `);

  db.exec('CREATE INDEX IF NOT EXISTS idx_print_jobs_identificador ON print_jobs(identificador)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_print_jobs_etapaCliente ON print_jobs(etapaCliente)');

  // Migration for filaments spool calculation
  const filamentsInfo = db.prepare("PRAGMA table_info(filaments)").all();
  const filamentsColumnNames = filamentsInfo.map(col => col.name);
  if (!filamentsColumnNames.includes('precoPago')) {
    db.exec('ALTER TABLE filaments ADD COLUMN precoPago REAL');
  }
  if (!filamentsColumnNames.includes('pesoCarretel')) {
    db.exec('ALTER TABLE filaments ADD COLUMN pesoCarretel REAL');
  }
  if (!filamentsColumnNames.includes('quantidadeCarreteis')) {
    db.exec('ALTER TABLE filaments ADD COLUMN quantidadeCarreteis INTEGER DEFAULT 1');
  }
} catch (error) {
  console.error('Erro ao executar migration:', error);
}

export default db;
