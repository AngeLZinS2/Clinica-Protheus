# Clínica Protheus

Sistema completo de gerenciamento para clínicas médicas com backend Flask (Python) e frontend React (Vite).

## 📋 Índice

- [Estrutura do Projeto](#estrutura-do-projeto)
- [Início Rápido](#início-rápido)
- [Backend](#backend-flaskpython)
- [Frontend](#frontend-reactvite)
- [Arquitetura](#arquitetura)
- [API Endpoints](#api-endpoints)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)

## 📁 Estrutura do Projeto

```
Clinica-Protheus/
├── backend/                    # 🔵 API Flask (Python)
│   ├── app/
│   │   ├── models/            # Modelos de dados (SQLAlchemy)
│   │   ├── schemas/           # Schemas de validação (Marshmallow)
│   │   ├── controllers/       # Controllers (rotas HTTP)
│   │   ├── services/          # Lógica de negócio
│   │   └── utils/             # Utilitários (auth, pagination, validators)
│   ├── migrations/            # Migrações do banco de dados
│   ├── instance/              # Banco de dados SQLite
│   ├── config.py              # Configurações da aplicação
│   ├── run.py                 # Entry point do servidor
│   ├── requirements.txt       # Dependências Python
│   └── README.md              # Documentação do backend
│
└── frontend/                   # 🟢 Interface React (Vite)
    ├── src/
    │   ├── components/        # Componentes reutilizáveis
    │   ├── pages/             # Páginas da aplicação
    │   ├── services/          # Comunicação com API
    │   └── context/           # Gerenciamento de estado
    ├── public/                # Arquivos públicos
    ├── package.json           # Dependências Node
    ├── vite.config.js         # Configuração Vite
    └── README.md              # Documentação do frontend
```

## 🚀 Início Rápido

### Pré-requisitos
- **Backend**: Python 3.8+ e pip
- **Frontend**: Node.js 16+ e npm

### Executar Localmente

**1. Backend:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python run.py
```
Servidor: `http://localhost:5000`

**2. Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Aplicação: `http://localhost:5173`

**3. Criar Usuário Admin:**
```bash
cd backend
python create_admin.py
```

## 🔵 Backend (Flask/Python)

### Estrutura MVC

O backend segue o padrão **MVC (Model-View-Controller)** com camada de serviços:

- **Models** (`app/models/`) - Definição de dados e relacionamentos
- **Schemas** (`app/schemas/`) - Validação e serialização (View)
- **Controllers** (`app/controllers/`) - Endpoints HTTP e controle de requisições
- **Services** (`app/services/`) - Lógica de negócio e regras

### Instalação

```bash
cd backend
pip install -r requirements.txt
```

### Configuração

Crie um arquivo `.env` baseado no `.env.example`:

```env
DATABASE_URL=sqlite:///clinic.db
JWT_SECRET_KEY=sua-chave-secreta-aqui
JWT_ACCESS_TOKEN_EXPIRES=3600
FLASK_DEBUG=True
FLASK_ENV=development
```

### Executar

```bash
# Modo desenvolvimento
python run.py

# Com debug
FLASK_DEBUG=True python run.py
```

### Comandos Úteis

```bash
# Criar usuário administrador
python create_admin.py

# Executar migrações
flask db upgrade

# Criar nova migração
flask db migrate -m "descrição da mudança"

# Reverter migração
flask db downgrade
```

## 🟢 Frontend (React/Vite)

### Instalação

```bash
cd frontend
npm install
```

### Executar

```bash
# Modo desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

### Configuração

O frontend se conecta automaticamente ao backend em `http://localhost:5000`. Para alterar, edite o arquivo de configuração da API.

## 🏗️ Arquitetura

### Backend - Padrão MVC

```
Request → Controller → Service → Model → Database
                ↓
            Schema (Validation)
                ↓
            Response (JSON)
```

**Componentes:**
- **Models**: Estrutura de dados (User, Patient, Appointment, Procedure, AuditLog)
- **Schemas**: Validação automática com Marshmallow
- **Controllers**: Endpoints REST organizados por recurso
- **Services**: Lógica de negócio isolada e reutilizável
- **Utils**: Autenticação JWT, paginação, validadores

### Frontend - React + Vite

```
User → Pages → Components → Services → API
         ↓
     Context (State)
```

**Componentes:**
- **Pages**: Telas principais (Login, Dashboard, Pacientes, etc.)
- **Components**: Componentes reutilizáveis (Navbar, Cards, Forms)
- **Services**: Comunicação com backend via Axios
- **Context**: Gerenciamento de estado global (Auth, Theme)

## 📡 API Endpoints

### Autenticação
- `POST /auth/login` - Login de usuário/paciente
- `POST /auth/change-password` - Alterar senha

### Usuários
- `GET /users` - Listar usuários (admin)
- `POST /users` - Criar usuário (admin)
- `GET /users/search?email=` - Buscar por email
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Remover usuário (admin)
- `POST /users/:id/reset-password` - Resetar senha (admin)

### Pacientes
- `GET /patients` - Listar pacientes
- `POST /patients` - Criar paciente
- `GET /patients/:id` - Buscar paciente
- `PUT /patients/:id` - Atualizar paciente
- `DELETE /patients/:id` - Remover paciente

### Atendimentos
- `GET /appointments` - Listar atendimentos
- `POST /appointments` - Criar atendimento
- `GET /appointments/:id` - Buscar atendimento
- `PUT /appointments/:id` - Atualizar atendimento
- `DELETE /appointments/:id` - Remover atendimento

### Procedimentos
- `GET /procedures` - Listar procedimentos
- `POST /procedures` - Criar procedimento (admin)
- `GET /procedures/:id` - Buscar procedimento
- `PUT /procedures/:id` - Atualizar procedimento (admin)
- `DELETE /procedures/:id` - Remover procedimento (admin)

### Dashboard
- `GET /dashboard/stats` - Estatísticas gerais

### Auditoria
- `GET /audit` - Logs de auditoria (admin)

## ✨ Funcionalidades

### Autenticação e Autorização
- ✅ Login de usuários (admin/default)
- ✅ Login de pacientes
- ✅ Autenticação JWT
- ✅ Controle de permissões por tipo de usuário
- ✅ Primeiro acesso com troca de senha obrigatória

### Gerenciamento de Pacientes
- ✅ Cadastro completo com endereço
- ✅ Cadastro de responsável (para menores de idade)
- ✅ Validação de CPF e email únicos
- ✅ Histórico de atendimentos

### Agendamento de Consultas
- ✅ Criação de atendimentos
- ✅ Associação com múltiplos procedimentos
- ✅ Cálculo automático de valor total
- ✅ Filtros por data
- ✅ Tipos: Plano de saúde ou Particular

### Procedimentos Médicos
- ✅ Cadastro de procedimentos
- ✅ Valores diferenciados (plano/particular)
- ✅ Descrição detalhada

### Dashboard
- ✅ Total de pacientes
- ✅ Atendimentos do dia
- ✅ Total de procedimentos
- ✅ Receita mensal

### Auditoria
- ✅ Log de todas as ações
- ✅ Rastreamento de usuário e IP
- ✅ Histórico de alterações
- ✅ Filtros avançados

## 🛠️ Tecnologias

### Backend
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Flask | 2.3.3 | Framework web |
| SQLAlchemy | 3.0.5 | ORM para banco de dados |
| Marshmallow | 3.20.1 | Serialização e validação |
| Flask-JWT-Extended | 4.5.3 | Autenticação JWT |
| Flask-CORS | 4.0.0 | CORS para API |
| SQLite | - | Banco de dados |

### Frontend
| Tecnologia | Descrição |
|------------|-----------|
| React | 18.x | Biblioteca UI |
| Vite | 5.x | Build tool |
| TailwindCSS | 3.x | Framework CSS |
| React Router | 6.x | Roteamento |
| Axios | - | Cliente HTTP |

## 📝 Desenvolvimento

### Padrões de Código

**Backend:**
- PEP 8 para Python
- Docstrings em funções públicas
- Type hints quando aplicável

**Frontend:**
- ESLint configurado
- Componentes funcionais com Hooks
- PropTypes para validação

### Estrutura de Commits

```
tipo(escopo): descrição curta

Descrição detalhada (opcional)
```

**Tipos:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Proprietary - Clínica Protheus © 2025

---

**Desenvolvido com ❤️ para Clínica Protheus**