import db from '../config/database.js';

const DEFAULT_CONFIG = {
  precoPorGrama: '1.00',
  whatsappNumero: '',
  whatsappTemplate: 'Olá! Vi o produto {NOME} no seu catálogo. Sou de {CIDADE}. Ele está disponível? Gostaria de comprar/combinar entrega em Sinop–MT.',
  linkLojaMercadoLivre: '',
  localizacao: 'Sinop – Mato Grosso',
  politicaLocal: 'Entregas locais sem frete / combine pelo WhatsApp'
};

export const getPublicConfig = (req, res) => {
  try {
    const configs = db.prepare('SELECT chave, valor FROM config').all();
    const configObj = {};

    configs.forEach(row => {
      try {
        configObj[row.chave] = JSON.parse(row.valor);
      } catch {
        configObj[row.chave] = row.valor;
      }
    });

    // Preencher com defaults se não existir
    Object.keys(DEFAULT_CONFIG).forEach(key => {
      if (!configObj[key]) {
        configObj[key] = DEFAULT_CONFIG[key];
      }
    });

    res.json(configObj);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
};

export const getAdminConfig = (req, res) => {
  try {
    const configs = db.prepare('SELECT * FROM config ORDER BY chave').all();
    const configObj = {};

    configs.forEach(row => {
      try {
        configObj[row.chave] = JSON.parse(row.valor);
      } catch {
        configObj[row.chave] = row.valor;
      }
    });

    // Preencher com defaults se não existir
    Object.keys(DEFAULT_CONFIG).forEach(key => {
      if (!configObj[key]) {
        configObj[key] = DEFAULT_CONFIG[key];
      }
    });

    res.json(configObj);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
};

export const updateConfig = (req, res) => {
  try {
    const updates = req.body;

    Object.keys(updates).forEach(key => {
      const value = typeof updates[key] === 'object' 
        ? JSON.stringify(updates[key]) 
        : updates[key];

      const existing = db.prepare('SELECT id FROM config WHERE chave = ?').get(key);
      if (existing) {
        db.prepare('UPDATE config SET valor = ?, updatedAt = CURRENT_TIMESTAMP WHERE chave = ?')
          .run(value, key);
      } else {
        db.prepare('INSERT INTO config (chave, valor, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP)')
          .run(key, value);
      }
    });

    const configs = db.prepare('SELECT * FROM config ORDER BY chave').all();
    const configObj = {};

    configs.forEach(row => {
      try {
        configObj[row.chave] = JSON.parse(row.valor);
      } catch {
        configObj[row.chave] = row.valor;
      }
    });

    res.json(configObj);
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
};

