import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const TOKEN_EXPIRATION = process.env.JWT_EXPIRES_IN || '7d';
const hasUpdatedAtColumn = () =>
  db
    .prepare('PRAGMA table_info(users)')
    .all()
    .some((column) => column.name === 'updatedAt');

const sanitizeUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    nome: user.nome || user.email,
    email: user.email,
    isActive: user.isActive !== 0,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRATION }
  );

export const login = async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const { password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    if (user.isActive === 0) {
      return res.status(403).json({ error: 'Usuário desativado' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const token = generateToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const register = async (req, res) => {
  try {
    const nome = req.body.nome.trim();
    const email = req.body.email.trim().toLowerCase();
    const { password } = req.body;

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Já existe um usuário com esse email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db
      .prepare('INSERT INTO users (nome, email, password, isActive) VALUES (?, ?, ?, 1)')
      .run(nome, email, hashedPassword);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: sanitizeUser(user),
      message: 'Usuário cadastrado com sucesso',
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const verifyToken = (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    if (!user || user.isActive === 0) {
      return res.status(401).json({ error: 'Usuário não autorizado' });
    }

    res.json({
      valid: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const listUsers = (req, res) => {
  try {
    const users = hasUpdatedAtColumn()
      ? db
          .prepare(`
            SELECT id, nome, email, COALESCE(isActive, 1) AS isActive, createdAt, updatedAt
            FROM users
            ORDER BY createdAt DESC
          `)
          .all()
      : db
          .prepare(`
            SELECT id, nome, email, COALESCE(isActive, 1) AS isActive, createdAt, createdAt AS updatedAt
            FROM users
            ORDER BY createdAt DESC
          `)
          .all();

    res.json(users.map(sanitizeUser));
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { nome, email, password, isActive } = req.body;

    const existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const updateFields = [];
    const updateValues = [];

    if (nome !== undefined) {
      const trimmedNome = nome.trim();
      updateFields.push('nome = ?');
      updateValues.push(trimmedNome);
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();
      const emailInUse = db
        .prepare('SELECT id FROM users WHERE email = ? AND id != ?')
        .get(normalizedEmail, userId);

      if (emailInUse) {
        return res.status(409).json({ error: 'Já existe um usuário com esse email' });
      }

      updateFields.push('email = ?');
      updateValues.push(normalizedEmail);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    if (isActive !== undefined) {
      const activeValue = isActive === true || isActive === 1 || isActive === '1' || isActive === 'true';

      if (!activeValue && userId === req.user.id) {
        return res.status(400).json({ error: 'Você não pode desativar sua própria conta' });
      }

      updateFields.push('isActive = ?');
      updateValues.push(activeValue ? 1 : 0);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    if (hasUpdatedAtColumn()) {
      updateFields.push('updatedAt = CURRENT_TIMESTAMP');
    }
    updateValues.push(userId);

    db.prepare(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    res.json(sanitizeUser(updatedUser));
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

export const deleteUser = (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Você não pode excluir sua própria conta' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const totalUsers = db.prepare('SELECT COUNT(*) AS total FROM users').get();
    if (totalUsers.total <= 1) {
      return res.status(400).json({ error: 'É necessário manter pelo menos um usuário' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
};
