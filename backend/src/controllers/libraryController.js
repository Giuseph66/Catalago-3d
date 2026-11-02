import db from '../config/database.js';
import { fetchRepoFiles, repoConfig } from '../utils/github.js';

export const getLibrary = async (req, res) => {
  try {
    const { files, truncated, fetchedAt } = await fetchRepoFiles({ refresh: req.query.refresh === '1' });
    const produtos = db
      .prepare('SELECT id, nome, slug, stlPath, modeloArquivo, publicado FROM products WHERE stlPath IS NOT NULL')
      .all();

    res.json({ ...repoConfig(), files, truncated, fetchedAt, produtos });
  } catch (error) {
    console.error('Erro ao ler repositório do GitHub:', error);
    res.status(502).json({ error: error.message || 'Não foi possível ler o repositório do GitHub' });
  }
};
