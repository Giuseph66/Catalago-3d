import db from '../config/database.js';
import { slugify } from '../utils/helpers.js';

export const listCategories = (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY nome').all();
    res.json(categories);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ error: 'Erro ao listar categorias' });
  }
};

export const getCategory = (req, res) => {
  try {
    const { id } = req.params;
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({ error: 'Erro ao buscar categoria' });
  }
};

export const createCategory = (req, res) => {
  try {
    const { nome, slug, icone } = req.body;
    const categorySlug = slug || slugify(nome);

    // Verificar se slug já existe
    const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(categorySlug);
    if (existing) {
      return res.status(400).json({ error: 'Slug já existe' });
    }

    const result = db.prepare('INSERT INTO categories (nome, slug, icone) VALUES (?, ?, ?)')
      .run(nome, categorySlug, icone || null);

    const newCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
};

export const updateCategory = (req, res) => {
  try {
    const { id } = req.params;
    const { nome, slug, icone } = req.body;

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    const categorySlug = slug || slugify(nome || category.nome);

    // Verificar se slug já existe em outra categoria
    if (slug || nome) {
      const existing = db.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?').get(categorySlug, id);
      if (existing) {
        return res.status(400).json({ error: 'Slug já existe' });
      }
    }

    const updateFields = [];
    const updateValues = [];

    if (nome !== undefined) {
      updateFields.push('nome = ?');
      updateValues.push(nome);
    }
    if (slug !== undefined || nome !== undefined) {
      updateFields.push('slug = ?');
      updateValues.push(categorySlug);
    }
    if (icone !== undefined) {
      updateFields.push('icone = ?');
      updateValues.push(icone);
    }

    updateFields.push('updatedAt = CURRENT_TIMESTAMP');
    updateValues.push(id);

    if (updateFields.length > 1) {
      db.prepare(`UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);
    }

    const updatedCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    res.json(updatedCategory);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
};

export const deleteCategory = (req, res) => {
  try {
    const { id } = req.params;

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    res.json({ message: 'Categoria excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    res.status(500).json({ error: 'Erro ao excluir categoria' });
  }
};

