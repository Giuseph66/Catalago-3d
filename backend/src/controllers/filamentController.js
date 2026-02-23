import db from '../config/database.js';

export const getFilaments = async (req, res) => {
    try {
        const filaments = db.prepare('SELECT * FROM filaments ORDER BY id DESC').all();
        res.json(filaments);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar filamentos' });
    }
};

export const createFilament = async (req, res) => {
    const { nome, cor, pesoTotal, custoPorGrama, precoPago, pesoCarretel, quantidadeCarreteis, status } = req.body;

    try {
        const stmt = db.prepare(`
      INSERT INTO filaments (nome, cor, pesoTotal, custoPorGrama, precoPago, pesoCarretel, quantidadeCarreteis, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const info = stmt.run(nome, cor, pesoTotal, custoPorGrama, precoPago || null, pesoCarretel || null, quantidadeCarreteis || 1, status || 'Disponível');

        const newFilament = db.prepare('SELECT * FROM filaments WHERE id = ?').get(info.lastInsertRowid);
        res.status(201).json(newFilament);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao criar filamento' });
    }
};

export const updateFilament = async (req, res) => {
    const { id } = req.params;
    const { nome, cor, pesoTotal, pesoUsado, custoPorGrama, precoPago, pesoCarretel, quantidadeCarreteis, status } = req.body;

    try {
        const stmt = db.prepare(`
      UPDATE filaments 
      SET nome = COALESCE(?, nome),
          cor = COALESCE(?, cor),
          pesoTotal = COALESCE(?, pesoTotal),
          pesoUsado = COALESCE(?, pesoUsado),
          custoPorGrama = COALESCE(?, custoPorGrama),
          precoPago = COALESCE(?, precoPago),
          pesoCarretel = COALESCE(?, pesoCarretel),
          quantidadeCarreteis = COALESCE(?, quantidadeCarreteis),
          status = COALESCE(?, status),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

        stmt.run(nome, cor, pesoTotal, pesoUsado, custoPorGrama, precoPago, pesoCarretel, quantidadeCarreteis, status, id);

        const updatedFilament = db.prepare('SELECT * FROM filaments WHERE id = ?').get(id);

        if (!updatedFilament) {
            return res.status(404).json({ error: 'Filamento não encontrado' });
        }

        res.json(updatedFilament);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar filamento' });
    }
};

export const deleteFilament = async (req, res) => {
    const { id } = req.params;

    try {
        const result = db.prepare('DELETE FROM filaments WHERE id = ?').run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Filamento não encontrado' });
        }

        res.json({ message: 'Filamento removido com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover filamento' });
    }
};
