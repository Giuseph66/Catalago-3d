import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔒 Backend Auth: Verificando token...', {
    hasAuthHeader: !!authHeader,
    hasToken: !!token,
    path: req.path
  });

  if (!token) {
    console.log('❌ Backend Auth: Token não fornecido');
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ Backend Auth: Token inválido ou expirado:', err.message);
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
    console.log('✅ Backend Auth: Token válido, usuário:', user);
    req.user = user;
    next();
  });
};

