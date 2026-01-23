import db from '../config/database.js';
import { slugify, calculatePrice } from '../utils/helpers.js';

function getPrecoPorGrama() {
  try {
    const config = db.prepare('SELECT valor FROM config WHERE chave = ?').get('precoPorGrama');
    return config ? parseFloat(config.valor) : 1.0;
  } catch {
    return 1.0;
  }
}

function getProductPrice(product) {
  // Se tiver preço personalizado, usa ele. Senão, calcula pelo peso
  if (product.preco != null && product.preco !== undefined && product.preco !== '' && product.preco !== 0) {
    const precoNum = parseFloat(product.preco);
    if (!isNaN(precoNum) && precoNum > 0) {
      return precoNum;
    }
  }
  return calculatePrice(product.peso, getPrecoPorGrama());
}

export const listProducts = (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      categoria = '',
      status = '',
      destaque = '',
      tags = '',
      orderBy = 'createdAt',
      orderDir = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (nome LIKE ? OR descricaoCurta LIKE ? OR descricaoCompleta LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (categoria) {
      query += ' AND categorias LIKE ?';
      params.push(`%"${categoria}"%`);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (destaque === 'true') {
      query += ' AND destaque = 1';
    }

    if (tags) {
      query += ' AND tags LIKE ?';
      params.push(`%"${tags}"%`);
    }

    // Ordenação
    const validOrderBy = ['createdAt', 'nome', 'peso', 'views'];
    const orderByField = validOrderBy.includes(orderBy) ? orderBy : 'createdAt';
    const orderDirection = orderDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    if (orderByField === 'peso') {
      query += ` ORDER BY peso ${orderDirection === 'ASC' ? 'ASC' : 'DESC'}`;
    } else {
      query += ` ORDER BY ${orderByField} ${orderDirection}`;
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const products = db.prepare(query).all(...params);

    // Buscar mídias para cada produto
    const productsWithMedia = products.map(product => {
      const media = db.prepare('SELECT * FROM media WHERE produtoId = ? ORDER BY ordem, id').all(product.id);
      return {
        ...product,
        categorias: JSON.parse(product.categorias || '[]'),
        tags: JSON.parse(product.tags || '[]'),
        historiaMidia: JSON.parse(product.historiaMidia || '[]'),
        media,
        preco: getProductPrice(product)
      };
    });

    // Contar total
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    const countParams = [];
    if (search) {
      countQuery += ' AND (nome LIKE ? OR descricaoCurta LIKE ? OR descricaoCompleta LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    if (categoria) {
      countQuery += ' AND categorias LIKE ?';
      countParams.push(`%"${categoria}"%`);
    }
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    if (destaque === 'true') {
      countQuery += ' AND destaque = 1';
    }
    if (tags) {
      countQuery += ' AND tags LIKE ?';
      countParams.push(`%"${tags}"%`);
    }

    const total = db.prepare(countQuery).get(...countParams).total;

    res.json({
      products: productsWithMedia,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
};

export const getProductById = (req, res) => {
  try {
    const { id } = req.params;
    console.log('📦 Backend: Buscando produto por ID:', id);

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    console.log('📦 Backend: Produto encontrado?', !!product);

    if (!product) {
      console.log('❌ Backend: Produto não encontrado com ID:', id);
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Buscar mídias
    const media = db.prepare('SELECT * FROM media WHERE produtoId = ? ORDER BY ordem, id').all(product.id);
    console.log('📦 Backend: Mídias encontradas:', media.length);

    const productData = {
      ...product,
      categorias: JSON.parse(product.categorias || '[]'),
      tags: JSON.parse(product.tags || '[]'),
      historiaMidia: JSON.parse(product.historiaMidia || '[]'),
      media,
      // Retornar o preço original do banco (pode ser null) e também o preço calculado para exibição
      precoOriginal: product.preco, // Preço personalizado do banco (null se não tiver)
      preco: getProductPrice(product) // Preço final (calculado ou personalizado)
    };

    console.log('✅ Backend: Produto retornado com sucesso');
    console.log('💰 Backend: Preço original do banco:', product.preco);
    console.log('💰 Backend: Preço final calculado:', productData.preco);
    res.json(productData);
  } catch (error) {
    console.error('❌ Backend: Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
};

export const getProductBySlug = (req, res) => {
  try {
    const { slug } = req.params;

    const product = db.prepare('SELECT * FROM products WHERE slug = ?').get(slug);

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Incrementar views
    db.prepare('UPDATE products SET views = views + 1 WHERE id = ?').run(product.id);

    // Buscar mídias
    const media = db.prepare('SELECT * FROM media WHERE produtoId = ? ORDER BY ordem, id').all(product.id);

    // Buscar depoimentos relacionados
    const testimonials = db.prepare('SELECT * FROM testimonials WHERE produtoId = ? ORDER BY createdAt DESC').all(product.id);

    const productData = {
      ...product,
      categorias: JSON.parse(product.categorias || '[]'),
      tags: JSON.parse(product.tags || '[]'),
      historiaMidia: JSON.parse(product.historiaMidia || '[]'),
      media,
      testimonials,
      preco: getProductPrice(product)
    };

    res.json(productData);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
};

export const createProduct = (req, res) => {
  try {
    const {
      nome,
      slug,
      descricaoCurta,
      descricaoCompleta,
      peso,
      altura,
      largura,
      profundidade,
      material,
      cor,
      preco,
      categorias = [],
      tags = [],
      status = 'PRONTA_ENTREGA',
      destaque = false,
      linkMercadoLivre,
      mensagemWhatsAppTemplate,
      historiaTitulo,
      historiaTexto,
      historiaMidia = []
    } = req.body;

    const productSlug = slug || slugify(nome);

    // Verificar se slug já existe
    const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(productSlug);
    if (existing) {
      return res.status(400).json({ error: 'Slug já existe' });
    }

    const result = db.prepare(`
      INSERT INTO products (
        nome, slug, descricaoCurta, descricaoCompleta, peso, altura, largura, profundidade, material, cor, preco,
        categorias, tags, status, destaque, linkMercadoLivre,
        mensagemWhatsAppTemplate, historiaTitulo, historiaTexto, historiaMidia
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      nome,
      productSlug,
      descricaoCurta || null,
      descricaoCompleta || null,
      peso,
      altura ? parseFloat(altura) : null,
      largura ? parseFloat(largura) : null,
      profundidade ? parseFloat(profundidade) : null,
      material || null,
      cor || null,
      preco ? parseFloat(preco) : null,
      JSON.stringify(categorias),
      JSON.stringify(tags),
      status,
      destaque ? 1 : 0,
      linkMercadoLivre || null,
      mensagemWhatsAppTemplate || null,
      historiaTitulo || null,
      historiaTexto || null,
      JSON.stringify(historiaMidia)
    );

    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      ...newProduct,
      categorias: JSON.parse(newProduct.categorias || '[]'),
      tags: JSON.parse(newProduct.tags || '[]'),
      historiaMidia: JSON.parse(newProduct.historiaMidia || '[]'),
      preco: getProductPrice(newProduct)
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
};

export const updateProduct = (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome,
      slug,
      descricaoCurta,
      descricaoCompleta,
      peso,
      altura,
      largura,
      profundidade,
      material,
      cor,
      preco,
      categorias,
      tags,
      status,
      destaque,
      linkMercadoLivre,
      mensagemWhatsAppTemplate,
      historiaTitulo,
      historiaTexto,
      historiaMidia
    } = req.body;

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const productSlug = slug || slugify(nome || product.nome);

    // Verificar se slug já existe em outro produto
    if (slug) {
      const existing = db.prepare('SELECT id FROM products WHERE slug = ? AND id != ?').get(productSlug, id);
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
      updateValues.push(productSlug);
    }
    if (descricaoCurta !== undefined) {
      updateFields.push('descricaoCurta = ?');
      updateValues.push(descricaoCurta);
    }
    if (descricaoCompleta !== undefined) {
      updateFields.push('descricaoCompleta = ?');
      updateValues.push(descricaoCompleta);
    }
    if (peso !== undefined) {
      updateFields.push('peso = ?');
      updateValues.push(peso);
    }
    if (altura !== undefined) {
      updateFields.push('altura = ?');
      updateValues.push(altura ? parseFloat(altura) : null);
    }
    if (largura !== undefined) {
      updateFields.push('largura = ?');
      updateValues.push(largura ? parseFloat(largura) : null);
    }
    if (profundidade !== undefined) {
      updateFields.push('profundidade = ?');
      updateValues.push(profundidade ? parseFloat(profundidade) : null);
    }
    if (material !== undefined) {
      updateFields.push('material = ?');
      updateValues.push(material || null);
    }
    if (cor !== undefined) {
      updateFields.push('cor = ?');
      updateValues.push(cor || null);
    }
    if (preco !== undefined) {
      updateFields.push('preco = ?');
      if (preco === null || preco === '' || preco === undefined) {
        updateValues.push(null);
      } else {
        const precoNum = parseFloat(preco);
        updateValues.push(isNaN(precoNum) ? null : precoNum);
      }
    }
    if (categorias !== undefined) {
      updateFields.push('categorias = ?');
      updateValues.push(JSON.stringify(categorias));
    }
    if (tags !== undefined) {
      updateFields.push('tags = ?');
      updateValues.push(JSON.stringify(tags));
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (destaque !== undefined) {
      updateFields.push('destaque = ?');
      updateValues.push(destaque ? 1 : 0);
    }
    if (linkMercadoLivre !== undefined) {
      updateFields.push('linkMercadoLivre = ?');
      updateValues.push(linkMercadoLivre);
    }
    if (mensagemWhatsAppTemplate !== undefined) {
      updateFields.push('mensagemWhatsAppTemplate = ?');
      updateValues.push(mensagemWhatsAppTemplate);
    }
    if (historiaTitulo !== undefined) {
      updateFields.push('historiaTitulo = ?');
      updateValues.push(historiaTitulo);
    }
    if (historiaTexto !== undefined) {
      updateFields.push('historiaTexto = ?');
      updateValues.push(historiaTexto);
    }
    if (historiaMidia !== undefined) {
      updateFields.push('historiaMidia = ?');
      updateValues.push(JSON.stringify(historiaMidia));
    }

    updateFields.push('updatedAt = CURRENT_TIMESTAMP');
    updateValues.push(id);

    if (updateFields.length > 1) {
      db.prepare(`UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);
    }

    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    res.json({
      ...updatedProduct,
      categorias: JSON.parse(updatedProduct.categorias || '[]'),
      tags: JSON.parse(updatedProduct.tags || '[]'),
      historiaMidia: JSON.parse(updatedProduct.historiaMidia || '[]'),
      preco: getProductPrice(updatedProduct)
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Erro ao atualizar produto', details: error.message });
  }
};

export const deleteProduct = (req, res) => {
  try {
    const { id } = req.params;

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(id);

    res.json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ error: 'Erro ao excluir produto' });
  }
};

