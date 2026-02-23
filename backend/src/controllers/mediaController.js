import db from '../config/database.js';
import { getMediaType } from '../utils/helpers.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');

export const uploadMedia = (req, res) => {
  try {
    const { produtoId } = req.params;
    console.log('📤 Backend Media: Upload recebido para produto ID:', produtoId);

    if (!req.file) {
      console.log('❌ Backend Media: Nenhum arquivo enviado');
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    console.log('📤 Backend Media: Arquivo recebido:', req.file.filename, req.file.size, 'bytes');

    const produto = db.prepare('SELECT * FROM products WHERE id = ?').get(produtoId);
    if (!produto) {
      console.log('❌ Backend Media: Produto não encontrado:', produtoId);
      // Deletar arquivo se produto não existe
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Gerar URL da mídia
    // Prioridade: BASE_URL (env) > X-Forwarded-Host/Origin > req.get('host')
    let baseUrl = process.env.BASE_URL;
    
    if (!baseUrl) {
      // Tentar obter do header X-Forwarded-Host (proxy reverso)
      const forwardedHost = req.get('X-Forwarded-Host');
      const forwardedProto = req.get('X-Forwarded-Proto') || req.protocol;
      
      if (forwardedHost) {
        baseUrl = `${forwardedProto}://${forwardedHost}`;
      } else {
        // Fallback: usar host da requisição
        const host = req.get('host');
        const protocol = req.protocol;
        baseUrl = `${protocol}://${host}`;
      }
    }
    
    // Garantir que não tenha /api no final
    baseUrl = baseUrl.replace(/\/api\/?$/, '');
    
    const url = `${baseUrl}/uploads/${req.file.filename}`;
    const tipo = getMediaType(req.file.filename);
    
    console.log('📤 Backend Media: URL gerada:', url);
    console.log('📤 Backend Media: BASE_URL env:', process.env.BASE_URL);
    console.log('📤 Backend Media: req.protocol:', req.protocol);
    console.log('📤 Backend Media: req.get("host"):', req.get('host'));
    console.log('📤 Backend Media: X-Forwarded-Host:', req.get('X-Forwarded-Host'));
    console.log('📤 Backend Media: X-Forwarded-Proto:', req.get('X-Forwarded-Proto'));

    // Buscar última ordem
    const lastMedia = db.prepare('SELECT ordem FROM media WHERE produtoId = ? ORDER BY ordem DESC LIMIT 1').get(produtoId);
    const ordem = lastMedia ? lastMedia.ordem + 1 : 0;

    // Se for a primeira mídia, marcar como capa
    const mediaCount = db.prepare('SELECT COUNT(*) as count FROM media WHERE produtoId = ?').get(produtoId).count;
    const isCapa = mediaCount === 0 ? 1 : 0;

    const result = db.prepare(`
      INSERT INTO media (produtoId, url, tipo, ordem, isCapa)
      VALUES (?, ?, ?, ?, ?)
    `).run(produtoId, url, tipo, ordem, isCapa);

    const newMedia = db.prepare('SELECT * FROM media WHERE id = ?').get(result.lastInsertRowid);
    console.log('✅ Backend Media: Mídia salva com sucesso:', newMedia.id);
    res.status(201).json(newMedia);
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Erro ao fazer upload' });
  }
};

export const reorderMedia = (req, res) => {
  try {
    const { produtoId } = req.params;
    const { mediaIds } = req.body; // Array de IDs na nova ordem

    if (!Array.isArray(mediaIds)) {
      return res.status(400).json({ error: 'mediaIds deve ser um array' });
    }

    const produto = db.prepare('SELECT * FROM products WHERE id = ?').get(produtoId);
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Atualizar ordem de cada mídia
    mediaIds.forEach((mediaId, index) => {
      db.prepare('UPDATE media SET ordem = ? WHERE id = ? AND produtoId = ?')
        .run(index, mediaId, produtoId);
    });

    const media = db.prepare('SELECT * FROM media WHERE produtoId = ? ORDER BY ordem').all(produtoId);
    res.json(media);
  } catch (error) {
    console.error('Erro ao reordenar mídia:', error);
    res.status(500).json({ error: 'Erro ao reordenar mídia' });
  }
};

export const setCapa = (req, res) => {
  try {
    const { produtoId, mediaId } = req.params;

    const produto = db.prepare('SELECT * FROM products WHERE id = ?').get(produtoId);
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const media = db.prepare('SELECT * FROM media WHERE id = ? AND produtoId = ?').get(mediaId, produtoId);
    if (!media) {
      return res.status(404).json({ error: 'Mídia não encontrada' });
    }

    // Remover capa de todas as mídias do produto
    db.prepare('UPDATE media SET isCapa = 0 WHERE produtoId = ?').run(produtoId);

    // Marcar nova capa
    db.prepare('UPDATE media SET isCapa = 1 WHERE id = ?').run(mediaId);

    const updatedMedia = db.prepare('SELECT * FROM media WHERE id = ?').get(mediaId);
    res.json(updatedMedia);
  } catch (error) {
    console.error('Erro ao definir capa:', error);
    res.status(500).json({ error: 'Erro ao definir capa' });
  }
};

export const deleteMedia = (req, res) => {
  try {
    const { produtoId, mediaId } = req.params;

    const media = db.prepare('SELECT * FROM media WHERE id = ? AND produtoId = ?').get(mediaId, produtoId);
    if (!media) {
      return res.status(404).json({ error: 'Mídia não encontrada' });
    }

    // Deletar arquivo
    const filename = path.basename(media.url);
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Deletar do banco
    db.prepare('DELETE FROM media WHERE id = ?').run(mediaId);

    res.json({ message: 'Mídia excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir mídia:', error);
    res.status(500).json({ error: 'Erro ao excluir mídia' });
  }
};

