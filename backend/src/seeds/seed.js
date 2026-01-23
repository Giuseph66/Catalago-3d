import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import db from '../config/database.js';
import { slugify } from '../utils/helpers.js';

dotenv.config();

async function seed() {
  try {
    console.log('🌱 Iniciando seed...');

    // Criar usuário admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@exemplo.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(adminEmail, hashedPassword);
      console.log('✅ Usuário admin criado:', adminEmail);
    } else {
      console.log('ℹ️  Usuário admin já existe');
    }

    // Criar categorias
    const categories = [
      { nome: 'Decoração', icone: '🎨' },
      { nome: 'Utilitários', icone: '🔧' },
      { nome: 'Jogos', icone: '🎮' }
    ];

    const categoryIds = {};
    categories.forEach(cat => {
      const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slugify(cat.nome));
      if (!existing) {
        const result = db.prepare('INSERT INTO categories (nome, slug, icone) VALUES (?, ?, ?)')
          .run(cat.nome, slugify(cat.nome), cat.icone);
        categoryIds[cat.nome] = result.lastInsertRowid;
        console.log(`✅ Categoria criada: ${cat.nome}`);
      } else {
        categoryIds[cat.nome] = existing.id;
        console.log(`ℹ️  Categoria já existe: ${cat.nome}`);
      }
    });

    // Criar produtos
    const products = [
      {
        nome: 'Suporte para Celular Premium',
        descricaoCurta: 'Suporte ergonômico para celular com ajuste de ângulo',
        descricaoCompleta: 'Suporte para celular feito em PLA, com design ergonômico que permite ajuste de ângulo. Perfeito para uso em mesa, cama ou escritório. Disponível em várias cores.',
        peso: 50,
        categorias: ['Utilitários'],
        tags: ['celular', 'suporte', 'escritório'],
        status: 'PRONTA_ENTREGA',
        destaque: true,
        linkMercadoLivre: 'https://www.mercadolivre.com.br/loja-exemplo',
        historiaTitulo: 'Ideal para Home Office',
        historiaTexto: 'Este suporte é perfeito para quem trabalha em casa e precisa manter o celular visível durante videochamadas ou para acompanhar notificações importantes.'
      },
      {
        nome: 'Vaso Decorativo Geométrico',
        descricaoCurta: 'Vaso moderno com padrão geométrico único',
        descricaoCompleta: 'Vaso decorativo com design geométrico moderno, perfeito para plantas pequenas. Design exclusivo que combina com qualquer decoração.',
        peso: 200,
        categorias: ['Decoração'],
        tags: ['vaso', 'decorativo', 'plantas'],
        status: 'PRONTA_ENTREGA',
        destaque: true,
        linkMercadoLivre: 'https://www.mercadolivre.com.br/loja-exemplo',
        historiaTitulo: 'Transforme seu espaço',
        historiaTexto: 'Este vaso não é apenas um recipiente, é uma peça de arte que transforma qualquer ambiente. Perfeito para presentear ou decorar sua casa.'
      },
      {
        nome: 'Peças de Xadrez Personalizadas',
        descricaoCurta: 'Jogo de xadrez completo com peças personalizadas',
        descricaoCompleta: 'Jogo de xadrez completo com peças únicas e personalizadas. Cada peça foi projetada com atenção aos detalhes para uma experiência de jogo premium.',
        peso: 500,
        categorias: ['Jogos'],
        tags: ['xadrez', 'jogos', 'personalizado'],
        status: 'SOB_ENCOMENDA',
        destaque: false,
        linkMercadoLivre: 'https://www.mercadolivre.com.br/loja-exemplo',
        historiaTitulo: 'Para os amantes do xadrez',
        historiaTexto: 'Este jogo de xadrez foi criado especialmente para quem aprecia o jogo e quer ter uma experiência única. As peças são resistentes e duráveis.'
      },
      {
        nome: 'Organizador de Mesa Multifuncional',
        descricaoCurta: 'Organizador com compartimentos para canetas, clipes e mais',
        descricaoCompleta: 'Organizador de mesa com múltiplos compartimentos para manter sua área de trabalho organizada. Design compacto e funcional.',
        peso: 150,
        categorias: ['Utilitários'],
        tags: ['organizador', 'escritório', 'mesa'],
        status: 'PRONTA_ENTREGA',
        destaque: true,
        linkMercadoLivre: 'https://www.mercadolivre.com.br/loja-exemplo'
      },
      {
        nome: 'Escultura Abstrata Moderna',
        descricaoCurta: 'Escultura decorativa com design abstrato contemporâneo',
        descricaoCompleta: 'Escultura decorativa com design abstrato que adiciona um toque moderno a qualquer ambiente. Perfeita para salas, escritórios ou áreas de convivência.',
        peso: 300,
        categorias: ['Decoração'],
        tags: ['escultura', 'arte', 'decorativo'],
        status: 'SOB_ENCOMENDA',
        destaque: false,
        linkMercadoLivre: 'https://www.mercadolivre.com.br/loja-exemplo',
        historiaTitulo: 'Arte para seu ambiente',
        historiaTexto: 'Esta escultura é uma peça única que demonstra personalidade e bom gosto. Ideal para quem busca algo diferente e exclusivo.'
      }
    ];

    const productIds = [];
    products.forEach(prod => {
      const slug = slugify(prod.nome);
      const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(slug);
      if (!existing) {
        const result = db.prepare(`
          INSERT INTO products (
            nome, slug, descricaoCurta, descricaoCompleta, peso,
            categorias, tags, status, destaque, linkMercadoLivre,
            historiaTitulo, historiaTexto
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          prod.nome,
          slug,
          prod.descricaoCurta,
          prod.descricaoCompleta,
          prod.peso,
          JSON.stringify(prod.categorias),
          JSON.stringify(prod.tags),
          prod.status,
          prod.destaque ? 1 : 0,
          prod.linkMercadoLivre,
          prod.historiaTitulo || null,
          prod.historiaTexto || null
        );
        productIds.push(result.lastInsertRowid);
        console.log(`✅ Produto criado: ${prod.nome}`);
      } else {
        productIds.push(existing.id);
        console.log(`ℹ️  Produto já existe: ${prod.nome}`);
      }
    });

    // Criar depoimentos
    const testimonials = [
      {
        nome: 'Maria Silva',
        cidade: 'Sinop-MT',
        texto: 'Produto excelente! Qualidade superior e entrega super rápida. Recomendo!',
        nota: 5,
        produtoId: productIds[0] || null
      },
      {
        nome: 'João Santos',
        cidade: 'Sinop-MT',
        texto: 'Ficou perfeito! Exatamente como na foto. O suporte é muito resistente.',
        nota: 5,
        produtoId: productIds[0] || null
      },
      {
        nome: 'Ana Costa',
        cidade: 'Sinop-MT',
        texto: 'Adorei o vaso! Ficou lindo na minha sala. A qualidade da impressão é impecável.',
        nota: 5,
        produtoId: productIds[1] || null
      },
      {
        nome: 'Carlos Oliveira',
        cidade: 'Sinop-MT',
        texto: 'Atendimento excelente e produto de primeira. Vou comprar mais!',
        nota: 5
      },
      {
        nome: 'Fernanda Lima',
        cidade: 'Sinop-MT',
        texto: 'O organizador é perfeito! Minha mesa ficou muito mais organizada. Super prático.',
        nota: 5,
        produtoId: productIds[3] || null
      },
      {
        nome: 'Roberto Alves',
        cidade: 'Sinop-MT',
        texto: 'Produto de qualidade e preço justo. Entrega local sem frete é um diferencial!',
        nota: 5
      }
    ];

    testimonials.forEach(test => {
      const existing = db.prepare('SELECT id FROM testimonials WHERE nome = ? AND texto = ?').get(test.nome, test.texto);
      if (!existing) {
        db.prepare(`
          INSERT INTO testimonials (nome, cidade, texto, nota, produtoId)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          test.nome,
          test.cidade,
          test.texto,
          test.nota,
          test.produtoId || null
        );
        console.log(`✅ Depoimento criado: ${test.nome}`);
      } else {
        console.log(`ℹ️  Depoimento já existe: ${test.nome}`);
      }
    });

    // Criar configurações padrão
    const defaultConfig = {
      precoPorGrama: '1.00',
      whatsappNumero: '5566999999999',
      whatsappTemplate: 'Olá! Vi o produto {NOME} no seu catálogo. Sou de {CIDADE}. Ele está disponível? Gostaria de comprar/combinar entrega em Sinop–MT.',
      linkLojaMercadoLivre: 'https://www.mercadolivre.com.br/loja-exemplo',
      localizacao: 'Sinop – Mato Grosso',
      politicaLocal: 'Entregas locais sem frete / combine pelo WhatsApp'
    };

    Object.keys(defaultConfig).forEach(key => {
      const existing = db.prepare('SELECT id FROM config WHERE chave = ?').get(key);
      if (!existing) {
        db.prepare('INSERT INTO config (chave, valor) VALUES (?, ?)')
          .run(key, defaultConfig[key]);
        console.log(`✅ Config criada: ${key}`);
      } else {
        console.log(`ℹ️  Config já existe: ${key}`);
      }
    });

    console.log('✅ Seed concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

seed();

