# Catálogo de Produtos de Impressão 3D

Sistema completo de catálogo de produtos de impressão 3D com front-end React e back-end Node.js, desenvolvido para uma loja em Sinop - Mato Grosso.

## 🚀 Características

- **Vitrine pública premium** com design profissional e responsivo
- **Viewer de mídia avançado** com suporte a imagens, GIFs e vídeos
- **Integração WhatsApp** com mensagens personalizadas automáticas
- **Integração Mercado Livre** com links diretos para produtos
- **Painel administrativo completo** para gerenciar produtos, categorias e depoimentos
- **Sistema de upload de mídia** com suporte a múltiplos formatos
- **Busca e filtros avançados** no catálogo
- **Sistema de depoimentos** para aumentar confiança
- **Destaques e badges** para produtos especiais

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn

## 🛠️ Instalação

### Back-end

1. Entre na pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` baseado no `.env.example`:
```bash
cp .env.example .env
```

4. Configure as variáveis de ambiente no `.env`:
```env
PORT=3001
JWT_SECRET=seu_secret_jwt_aqui_mude_em_producao
ADMIN_EMAIL=admin@exemplo.com
ADMIN_PASSWORD=senha_segura_aqui
DB_PATH=./database.sqlite
UPLOAD_DIR=./uploads
NODE_ENV=development
```

5. Inicie o servidor:
```bash
npm start
# ou para desenvolvimento com auto-reload:
npm run dev
```

O backend estará rodando em `http://localhost:3001`

**Nota:** O usuário admin é criado automaticamente na primeira inicialização do servidor usando as credenciais do `.env`. Se você quiser criar dados de exemplo (produtos, categorias, depoimentos), execute:
```bash
npm run seed
```

### Front-end

1. Entre na pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` baseado no `.env.example`:
```bash
cp .env.example .env
```

4. Configure a URL da API no `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
3d/
├── backend/              # API Node.js + Express
│   ├── src/
│   │   ├── config/       # Configurações (banco, upload)
│   │   ├── controllers/ # Controladores da API
│   │   ├── middleware/  # Middlewares (auth, etc)
│   │   ├── models/      # Modelos de dados
│   │   ├── routes/      # Rotas da API
│   │   ├── seeds/       # Seeds de dados iniciais
│   │   ├── utils/       # Utilitários
│   │   └── server.js    # Entry point
│   ├── uploads/         # Arquivos de mídia (criado automaticamente)
│   └── database.sqlite   # Banco de dados (criado automaticamente)
│
└── frontend/             # React + Vite + Tailwind
    ├── src/
    │   ├── components/   # Componentes React
    │   │   ├── admin/    # Componentes do painel admin
    │   │   ├── public/   # Componentes públicos
    │   │   └── shared/   # Componentes compartilhados
    │   ├── pages/        # Páginas
    │   ├── context/      # Context API
    │   ├── services/     # Serviços (API)
    │   └── utils/        # Utilitários
    └── public/           # Arquivos estáticos
```

## 🔐 Acesso Admin

Após executar o seed, você pode fazer login no painel admin com as credenciais configuradas no `.env`:

- **URL**: `http://localhost:3000/admin/login`
- **Email**: O valor de `ADMIN_EMAIL` no `.env`
- **Senha**: O valor de `ADMIN_PASSWORD` no `.env`

## 📝 Funcionalidades Principais

### Vitrine Pública

- **Home**: Página inicial com destaques, categorias e depoimentos
- **Catálogo**: Listagem de produtos com busca, filtros e ordenação
- **Produto**: Página detalhada com viewer de mídia premium

### Painel Admin

- **Dashboard**: Estatísticas e ações rápidas
- **Produtos**: CRUD completo com upload de mídia
- **Categorias**: Gerenciamento de categorias
- **Depoimentos**: Gerenciamento de depoimentos
- **Configurações**: Configurações gerais do sistema

### Integrações

- **WhatsApp**: Botão flutuante e botões em produtos com mensagem personalizada
- **Mercado Livre**: Links diretos para produtos ou loja

## 🎨 Customização

### Preço por Grama

O preço é calculado automaticamente: `peso (gramas) × preço por grama`

Configure o preço por grama em: **Admin → Configurações**

### Mensagem WhatsApp

A mensagem do WhatsApp pode ser personalizada em:
- **Admin → Configurações** (template global)
- **Admin → Produtos → Editar** (template por produto)

Variáveis disponíveis:
- `{NOME}`: Nome do produto
- `{CIDADE}`: Cidade do cliente (padrão: Sinop-MT)

### Localização

A localização e política local podem ser configuradas em:
**Admin → Configurações**

## 📦 Dados Iniciais (Seed)

O seed cria:
- 1 usuário admin
- 3 categorias (Decoração, Utilitários, Jogos)
- 5 produtos de exemplo
- 6 depoimentos
- Configurações padrão

## 🚀 Deploy

### Back-end

1. Configure as variáveis de ambiente no servidor
2. Certifique-se de que a pasta `uploads` existe e tem permissões de escrita
3. Execute `npm run seed` para criar dados iniciais
4. Inicie com `npm start` ou use PM2/similar

### Front-end (Vercel)

1. **Configure a variável de ambiente no Vercel:**
   - Acesse o painel do Vercel
   - Vá em **Settings** → **Environment Variables**
   - Adicione: `VITE_API_URL` com a URL completa do seu backend (ex: `https://seu-backend.herokuapp.com/api` ou `https://api.seudominio.com/api`)

2. **Configure o projeto no Vercel:**
   - **Root Directory**: `frontend` (se o frontend está em uma subpasta)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Arquivo `vercel.json`:**
   - O arquivo `vercel.json` já está configurado na pasta `frontend` para redirecionar todas as rotas para `index.html` (necessário para React Router funcionar)

4. **Importante:**
   - Certifique-se de que o backend está acessível publicamente
   - Configure CORS no backend para permitir requisições do domínio do Vercel
   - O arquivo `vercel.json` resolve o problema de 404 em rotas como `/admin/login`

### Front-end (Outros Serviços)

1. Configure `VITE_API_URL` com a URL do backend em produção
2. Execute `npm run build`
3. Sirva a pasta `dist` com um servidor web (nginx, Apache, etc)
4. Configure o servidor para redirecionar todas as rotas para `index.html` (SPA routing)

### Uploads

Em produção, considere:
- Usar um serviço de storage (S3, Cloudinary, etc)
- Configurar CORS adequadamente
- Implementar CDN para mídias

## 🐛 Troubleshooting

### Erro ao fazer upload de mídia

- Verifique se a pasta `uploads` existe no backend
- Verifique permissões de escrita na pasta
- Verifique o tamanho máximo do arquivo (padrão: 50MB)

### Erro de conexão com API

- Verifique se o backend está rodando
- Verifique a URL em `VITE_API_URL` (no Vercel, configure como variável de ambiente)
- Verifique CORS no backend
- No Vercel: Certifique-se de que a variável `VITE_API_URL` está configurada corretamente nas Environment Variables

### Erro 404 no Vercel (rotas como /admin/login)

- Verifique se o arquivo `vercel.json` está na pasta `frontend`
- O arquivo deve conter a configuração de rewrites para redirecionar todas as rotas para `index.html`

### Erro de autenticação

- Verifique se o token JWT está sendo enviado
- Verifique se `JWT_SECRET` está configurado
- Limpe o localStorage e faça login novamente

## 📄 Licença

Este projeto foi desenvolvido para uso específico.

## 👨‍💻 Desenvolvimento

### Tecnologias Utilizadas

**Back-end:**
- Express.js
- SQLite (better-sqlite3)
- JWT (jsonwebtoken)
- Bcrypt
- Multer (upload)
- Express Validator

**Front-end:**
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Framer Motion
- React Icons

### Scripts Disponíveis

**Back-end:**
- `npm start`: Inicia o servidor
- `npm run dev`: Inicia com auto-reload
- `npm run seed`: Executa o seed

**Front-end:**
- `npm run dev`: Servidor de desenvolvimento
- `npm run build`: Build para produção
- `npm run preview`: Preview do build

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Logs do backend no console
2. Console do navegador (F12)
3. Variáveis de ambiente
4. Permissões de arquivos e pastas

# Catalago-3d
