<!-- c3857b36-6c49-4bd5-9bbc-0050958e58f3 49c2dac3-7bcf-4eaa-be28-5a2e58ef20c1 -->
# Sistema de Catálogo de Produtos de Impressão 3D

## Arquitetura Geral

```
3d/
├── backend/          # API Node.js + Express
├── frontend/         # React + Vite + Tailwind
└── README.md
```

## Back-end (Express + SQLite)

### Estrutura de Pastas

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Configuração SQLite (Sequelize ou sqlite3)
│   │   └── upload.js        # Multer config para uploads
│   ├── models/
│   │   ├── Product.js       # Modelo Produto
│   │   ├── Category.js     # Modelo Categoria
│   │   ├── Testimonial.js  # Modelo Depoimento
│   │   ├── Media.js         # Modelo Mídia
│   │   └── Config.js        # Modelo Configurações
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── testimonialController.js
│   │   ├── mediaController.js
│   │   └── configController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── testimonials.js
│   │   ├── media.js
│   │   └── config.js
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   └── upload.js        # Multer middleware
│   ├── utils/
│   │   ├── validators.js    # Validações
│   │   └── helpers.js       # Funções auxiliares
│   ├── seeds/
│   │   └── seed.js          # Dados iniciais
│   └── server.js            # Entry point
├── uploads/                 # Pasta de mídias (gitignored)
├── .env.example
├── .env
└── package.json
```

### Modelos de Dados

**Product:**

- id, nome, slug, descricaoCurta, descricaoCompleta
- peso (gramas), categorias (JSON), tags (JSON)
- status (PRONTA_ENTREGA | SOB_ENCOMENDA)
- destaque (boolean), linkMercadoLivre
- mensagemWhatsAppTemplate (opcional)
- historiaTitulo, historiaTexto, historiaMidia (JSON)
- views (contador), createdAt, updatedAt

**Category:**

- id, nome, slug, icone (opcional)

**Testimonial:**

- id, nome, cidade, texto, nota (1-5, opcional)
- fotoUrl (opcional), produtoId (opcional, FK)
- createdAt

**Media:**

- id, produtoId (FK), url, tipo (image|gif|video)
- ordem, isCapa (boolean)

**Config:**

- id, chave, valor (JSON)
- Chaves: precoPorGrama, whatsappNumero, whatsappTemplate
- linkLojaMercadoLivre, localizacao, politicaLocal

**User (Admin):**

- id, email, senha (hash), createdAt

### Endpoints da API

**Públicos:**

- `GET /api/products` - Listar (com paginação, busca, filtros, ordenação)
- `GET /api/products/:slug` - Detalhes do produto
- `GET /api/categories` - Listar categorias
- `GET /api/testimonials` - Listar depoimentos (com filtro por produto)
- `GET /api/config` - Configurações públicas

**Protegidos (JWT):**

- `POST /api/auth/login` - Login admin
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Editar produto
- `DELETE /api/products/:id` - Excluir produto
- `POST /api/products/:id/media` - Upload mídia
- `PUT /api/products/:id/media/reorder` - Reordenar mídia
- `PUT /api/products/:id/media/:mediaId/capa` - Marcar capa
- `DELETE /api/products/:id/media/:mediaId` - Excluir mídia
- CRUD completo para categories, testimonials
- `GET /api/config/admin` - Config admin
- `PUT /api/config` - Atualizar config

### Funcionalidades Back-end

- Autenticação JWT (bcrypt para senha)
- Upload de mídia (Multer) - suporta jpg/png/webp/gif/mp4/webm
- Validações com express-validator ou joi
- Paginação (limit/offset)
- Busca full-text (nome, descrição)
- Filtros (categoria, status, tags, destaque)
- Ordenação (novidades, preço, views)
- Incremento de views ao acessar produto
- Seed inicial com 5 produtos, 3 categorias, 6 depoimentos

## Front-end (React + Vite + Tailwind)

### Estrutura de Pastas

```
frontend/
├── src/
│   ├── components/
│   │   ├── public/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductViewer.jsx    # Viewer premium
│   │   │   ├── TestimonialCard.jsx
│   │   │   ├── CategoryGrid.jsx
│   │   │   └── WhatsAppButton.jsx   # Botão flutuante
│   │   ├── admin/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   ├── MediaUploader.jsx
│   │   │   ├── MediaGallery.jsx
│   │   │   ├── CategoryForm.jsx
│   │   │   ├── TestimonialForm.jsx
│   │   │   └── ConfigForm.jsx
│   │   └── shared/
│   │       ├── Loading.jsx
│   │       ├── Skeleton.jsx
│   │       └── Modal.jsx
│   ├── pages/
│   │   ├── public/
│   │   │   ├── Home.jsx
│   │   │   ├── Catalog.jsx
│   │   │   └── ProductDetail.jsx
│   │   └── admin/
│   │       ├── Login.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Products.jsx
│   │       ├── ProductEdit.jsx
│   │       ├── Categories.jsx
│   │       ├── Testimonials.jsx
│   │       └── Settings.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useProducts.js
│   │   └── useApi.js
│   ├── services/
│   │   └── api.js            # Axios config
│   ├── utils/
│   │   ├── whatsapp.js       # Gerar link WhatsApp
│   │   └── formatters.js     # Formatação de preço, etc
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── App.jsx
│   └── main.jsx
├── public/
├── tailwind.config.js
├── vite.config.js
└── package.json
```

### Páginas Públicas

**Home (`/`):**

- Header com logo e pesquisa
- Seção "Estamos em Sinop – MT" (destaque local)
- Carrossel de destaques
- Grid de categorias
- Seção de depoimentos (3-6 cards)
- Seção "Como comprar" (ML vs WhatsApp)
- Footer com contato

**Catálogo (`/catalogo`):**

- Barra de pesquisa
- Filtros laterais (categoria, status, tags)
- Ordenação (dropdown)
- Grid responsivo de produtos
- Paginação ou infinite scroll
- Loading states e skeletons

**Produto (`/produto/:slug`):**

- Viewer premium de mídia (zoom, vídeo, gif)
- Informações: nome, preço (R$ peso), peso, status badge
- Descrição completa
- Seção "História / em uso" (se existir)
- Depoimentos relacionados
- Bloco "Sinop – MT: entrega local"
- Botões fixos: "Comprar no Mercado Livre" e "Chamar no WhatsApp"

### Viewer Premium de Mídia

- Imagem/vídeo principal em destaque
- Miniaturas clicáveis abaixo
- Zoom em imagens (lightbox)
- Suporte a vídeo HTML5
- Suporte a GIF animado
- Indicador de tipo de mídia
- Navegação por teclado (setas)

### Integração WhatsApp

Função `generateWhatsAppLink(nomeProduto, cidade, status)`:

- Template: "Olá! Vi o produto {NOME} no seu catálogo. Sou de {CIDADE}. Ele está disponível? Gostaria de comprar/combinar entrega em Sinop–MT."
- Se "Sob encomenda": adiciona "Entendo que é sob encomenda. Qual o prazo?"
- Usa número da config global
- Botão flutuante sempre visível

### Integração Mercado Livre

- Botão usa `linkMercadoLivre` do produto
- Fallback para `linkLojaMercadoLivre` da config
- Abre em nova aba

### Painel Admin

**Login (`/admin/login`):**

- Form simples com email/senha
- Redireciona para dashboard

**Dashboard (`/admin`):**

- Estatísticas rápidas (total produtos, etc)
- Links rápidos para CRUDs

**Produtos (`/admin/produtos`):**

- Lista com ações (editar, excluir)
- Botão "Novo produto"
- Form completo com todos os campos
- Upload de mídia com preview
- Reordenação drag-and-drop ou botões
- Marcar capa
- Editor de texto rico (opcional, ou textarea)

**Categorias, Depoimentos, Configurações:**

- CRUDs simples e diretos
- Forms com validação

### Design System (Tailwind)

- Cores: paleta profissional (azul/verde como primário)
- Tipografia: Inter ou similar
- Espaçamento: consistente (4px base)
- Componentes: cards, buttons, inputs padronizados
- Responsivo: mobile-first
- Micro-interações: hover, transitions, loading states

## Configuração e Deploy

### Variáveis de Ambiente

**Back-end (.env):**

```
PORT=3001
JWT_SECRET=seu_secret_aqui
ADMIN_EMAIL=admin@exemplo.com
ADMIN_PASSWORD=senha_segura_hash
DB_PATH=./database.sqlite
UPLOAD_DIR=./uploads
NODE_ENV=development
```

**Front-end (.env):**

```
VITE_API_URL=http://localhost:3001/api
```

### Seeds Iniciais

- 5 produtos fictícios (variados: pronta entrega, sob encomenda, com/sem destaque)
- 3 categorias (ex: "Decoração", "Utilitários", "Jogos")
- 6 depoimentos (alguns com produto relacionado)
- Config inicial com valores padrão

## Tecnologias e Dependências

**Back-end:**

- express, cors, dotenv
- sqlite3 ou sequelize + sqlite3
- jsonwebtoken, bcrypt
- multer (upload)
- express-validator ou joi
- uuid (para nomes únicos de arquivo)

**Front-end:**

- react, react-router-dom
- axios
- tailwindcss, autoprefixer
- react-icons (ícones)
- framer-motion (opcional, para animações)
- react-image-gallery ou similar (viewer)

## Checklist de Implementação

1. Setup inicial (back-end e front-end)
2. Banco de dados e modelos
3. Autenticação JWT
4. CRUD de produtos (sem mídia ainda)
5. Upload de mídia
6. Endpoints públicos (listagem, detalhes)
7. Front-end público (home, catálogo, produto)
8. Viewer premium de mídia
9. Integração WhatsApp e Mercado Livre
10. Painel admin (login, CRUDs)
11. Seeds e configurações
12. Polimento UI/UX
13. README completo