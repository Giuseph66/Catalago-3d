import db from '../config/database.js';

export const listTestimonials = (req, res) => {
  try {
    const { produtoId } = req.query;
    
    let query = 'SELECT * FROM testimonials';
    const params = [];
    
    if (produtoId) {
      query += ' WHERE produtoId = ?';
      params.push(produtoId);
    }
    
    query += ' ORDER BY createdAt DESC';
    
    const testimonials = db.prepare(query).all(...params);
    res.json(testimonials);
  } catch (error) {
    console.error('Erro ao listar depoimentos:', error);
    res.status(500).json({ error: 'Erro ao listar depoimentos' });
  }
};

export const getTestimonial = (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id);
    
    if (!testimonial) {
      return res.status(404).json({ error: 'Depoimento não encontrado' });
    }
    
    res.json(testimonial);
  } catch (error) {
    console.error('Erro ao buscar depoimento:', error);
    res.status(500).json({ error: 'Erro ao buscar depoimento' });
  }
};

export const createTestimonial = (req, res) => {
  try {
    const { nome, cidade, texto, nota, fotoUrl, produtoId } = req.body;

    const result = db.prepare(`
      INSERT INTO testimonials (nome, cidade, texto, nota, fotoUrl, produtoId)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(nome, cidade || null, texto, nota || null, fotoUrl || null, produtoId || null);

    const newTestimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newTestimonial);
  } catch (error) {
    console.error('Erro ao criar depoimento:', error);
    res.status(500).json({ error: 'Erro ao criar depoimento' });
  }
};

export const updateTestimonial = (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cidade, texto, nota, fotoUrl, produtoId } = req.body;

    const testimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Depoimento não encontrado' });
    }

    const updateFields = [];
    const updateValues = [];

    if (nome !== undefined) {
      updateFields.push('nome = ?');
      updateValues.push(nome);
    }
    if (cidade !== undefined) {
      updateFields.push('cidade = ?');
      updateValues.push(cidade);
    }
    if (texto !== undefined) {
      updateFields.push('texto = ?');
      updateValues.push(texto);
    }
    if (nota !== undefined) {
      updateFields.push('nota = ?');
      updateValues.push(nota);
    }
    if (fotoUrl !== undefined) {
      updateFields.push('fotoUrl = ?');
      updateValues.push(fotoUrl);
    }
    if (produtoId !== undefined) {
      updateFields.push('produtoId = ?');
      updateValues.push(produtoId);
    }

    if (updateFields.length > 0) {
      updateValues.push(id);
      db.prepare(`UPDATE testimonials SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);
    }

    const updatedTestimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id);
    res.json(updatedTestimonial);
  } catch (error) {
    console.error('Erro ao atualizar depoimento:', error);
    res.status(500).json({ error: 'Erro ao atualizar depoimento' });
  }
};

export const deleteTestimonial = (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Depoimento não encontrado' });
    }

    db.prepare('DELETE FROM testimonials WHERE id = ?').run(id);
    res.json({ message: 'Depoimento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir depoimento:', error);
    res.status(500).json({ error: 'Erro ao excluir depoimento' });
  }
};

