# Bella Acessórios - Setup do Projeto

## Pré-requisitos

1. Node.js 18+
2. Conta no PostgreSQL (pode usar [Neon](https://neon.tech) ou [Supabase](https://supabase.com))

## Passo a Passo

### 1. Clonar o repositório

```bash
cd bella-acessorios
npm install
```

### 2. Configurar Banco de Dados

Crie uma conta gratuita no [Neon](https://neon.tech) ou [Supabase](https://supabase.com) e crie um novo projeto PostgreSQL.

Copie a URL de conexão (formato: `postgresql://user:password@host:5432/dbname`).

### 3. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o `.env` e configure:
- `DATABASE_URL` - sua URL do PostgreSQL
- `NEXTAUTH_SECRET` - gere com: `openssl rand -base64 32`
- `NEXTAUTH_URL` - `http://localhost:3000`

### 4. Rodar migrations e seeds

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 5. Iniciar desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## Estrutura do Projeto

```
src/
├── app/              # Next.js App Router
│   ├── page.tsx      # Home
│   ├── catalog/      # Catálogo
│   ├── cart/        # Carrinho
│   ├── checkout/    # Checkout
│   ├── product/     # Página de produto
│   └── api/         # API Routes
├── components/      # Componentes React
├── lib/             # Utilitários e DB
└── types/           # Tipos TypeScript
```

---

## Deploy na Vercel

1. Crie uma conta na [Vercel](https://vercel.com)
2. Importe o repositório
3. Configure as variáveis de ambiente na Vercel
4. Deploy automático

---

## Acesso Admin

- URL: `/admin`
- Email: `belaacessoriossa@gmail.com`
- Senha: `admin123` (mude após primeiro acesso!)

---

## Próximos Passos (Módulos)

- [x] Módulo 1-2: Setup e Banco de Dados ✓
- [ ] Módulo 3: Autenticação
- [ ] Módulo 4-5: Catálogo e Produto
- [ ] Módulo 6: Carrinho
- [ ] Módulo 7-8: Checkout e Pagamento
- [ ] Módulo 9-12: Área Cliente e Admin
- [ ] Módulo 13-14: SEO e Segurança