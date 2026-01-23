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
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
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

  CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
  CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
  CREATE INDEX IF NOT EXISTS idx_products_destaque ON products(destaque);
  CREATE INDEX IF NOT EXISTS idx_media_produtoId ON media(produtoId);
  CREATE INDEX IF NOT EXISTS idx_testimonials_produtoId ON testimonials(produtoId);
`);

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
} catch (error) {
  console.error('Erro ao executar migration:', error);
}

export default db;

