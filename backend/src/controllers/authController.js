import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Backend: Tentativa de login recebida:', { email });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    console.log('🔐 Backend: Usuário encontrado?', !!user);

    if (!user) {
      console.log('❌ Backend: Usuário não encontrado');
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    console.log('🔐 Backend: Senha válida?', validPassword);

    if (!validPassword) {
      console.log('❌ Backend: Senha inválida');
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Backend: Login bem-sucedido, token gerado');
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('❌ Backend: Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

