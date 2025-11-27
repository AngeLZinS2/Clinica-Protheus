# API de Gestão de Clínicas Médicas

API completa para gestão de clínicas médicas desenvolvida em Python com Flask, seguindo o padrão MVC, utilizando autenticação JWT e banco SQLite. O frontend foi construído com React e Tailwind CSS, apresentando um design moderno com **Dark Mode** nativo e exclusivo.

## 🚀 Tecnologias

- **Python 3.11**
- **Flask** - Framework web
- **SQLAlchemy** - ORM
- **Flask-Migrate** - Migrations de banco
- **Flask-JWT-Extended** - Autenticação JWT
- **SQLite** - Banco de dados
- **bcrypt** - Hash de senhas

### Frontend
- **React** - Biblioteca JS para interfaces
- **Tailwind CSS** - Framework de estilização
- **Vite** - Build tool
- **Lucide React** - Ícones
- **Axios** - Requisições HTTP
- **React Router Dom** - Roteamento
- **React Hook Form** - Gerenciamento de formulários

## 📁 Estrutura do Projeto

```
├── app/
│   ├── __init__.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── patient.py
│   │   ├── procedure.py
│   │   └── appointment.py
│   ├── services/
│   │   ├── user_service.py
│   │   ├── patient_service.py
│   │   ├── procedure_service.py
│   │   └── appointment_service.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── patients.py
│   │   ├── procedures.py
│   │   └── appointments.py
│   └── utils/
│       ├── auth.py
│       ├── validators.py
│       └── pagination.py
├── config.py
├── run.py
├── requirements.txt
├── create_admin.py
├── clinic.db (criado automaticamente)
├── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

## 🔧 Como Executar

### Pré-requisitos

- Python 3.11+
- pip

### Passo a Passo

1. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env` se necessário.

2. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Inicialize o banco de dados:**
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

4. **Crie o usuário administrador:**
   ```bash
   python create_admin.py
   ```

5. **Execute a aplicação:**
   ```bash
   python run.py
   ```

6. **Execute o Frontend:**
   Em um novo terminal, navegue até a pasta `frontend` e execute:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

A API estará disponível em `http://localhost:5000` e o Frontend em `http://localhost:5173`

## 🔐 Autenticação

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "admin@clinic.com",
  "senha": "admin123"
}
```

**Resposta:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "nome": "Administrador",
    "email": "admin@clinic.com",
    "tipo": "admin"
  }
}
```

### Uso do Token
Para acessar endpoints protegidos, inclua o token no header:
```
Authorization: Bearer <access_token>
```

## 📚 Endpoints da API

### 👥 Usuários

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/users` | Criar usuário | Admin |
| GET | `/users` | Listar usuários | Admin |
| GET | `/users/search?email=...` | Buscar por email | Autenticado |
| PUT | `/users/<id>` | Atualizar usuário | Próprio usuário ou Admin |
| DELETE | `/users/<id>` | Remover usuário | Admin |
| POST | `/users/<id>/reset-password` | Resetar senha | Admin |

### 🏥 Pacientes

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/patients` | Criar paciente | Autenticado |
| GET | `/patients` | Listar pacientes | Autenticado |
| GET | `/patients/<id>` | Buscar por ID | Autenticado |
| PUT | `/patients/<id>` | Atualizar paciente | Autenticado |
| DELETE | `/patients/<id>` | Remover paciente | Autenticado |

### 🔬 Procedimentos

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/procedures` | Criar procedimento | Admin |
| GET | `/procedures` | Listar procedimentos | Autenticado |
| GET | `/procedures/<id>` | Buscar por ID | Autenticado |
| PUT | `/procedures/<id>` | Atualizar procedimento | Admin |
| DELETE | `/procedures/<id>` | Remover procedimento | Admin |

### 📅 Atendimentos

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/appointments` | Criar atendimento | Autenticado |
| GET | `/appointments` | Listar atendimentos | Autenticado |
| GET | `/appointments/<id>` | Buscar por ID | Autenticado |
| PUT | `/appointments/<id>` | Atualizar atendimento | Criador ou Admin |
| DELETE | `/appointments/<id>` | Remover atendimento | Criador ou Admin |

### 📄 Parâmetros de Paginação

Todos os endpoints de listagem aceitam:
- `?page=1` - Número da página (padrão: 1)
- `?limit=10` - Itens por página (padrão: 10, máximo: 100)

### 📅 Filtros de Data (Atendimentos)

- `?start_date=2024-01-01T00:00:00` - Data inicial
- `?end_date=2024-12-31T23:59:59` - Data final

## 📋 Exemplos de Requisições

### Criar Paciente
```bash
POST /patients
Content-Type: application/json
Authorization: Bearer <token>

{
  "cpf": "12345678901",
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "11999999999",
  "data_nascimento": "1990-01-15",
  "endereco": {
    "estado": "SP",
    "cidade": "São Paulo",
    "bairro": "Centro",
    "cep": "01000000",
    "rua": "Rua das Flores",
    "numero": "123"
  },
  "responsible": {
    "nome": "Maria Silva",
    "cpf": "98765432100",
    "data_nascimento": "1985-05-10",
    "email": "maria@email.com",
    "telefone": "11888888888"
  }
}
```

### Criar Atendimento
```bash
POST /appointments
Content-Type: application/json
Authorization: Bearer <token>

{
  "data_hora": "2024-01-15T14:30:00",
  "patient_id": "uuid-do-paciente",
  "tipo": "particular",
  "procedures": ["uuid-procedimento-1", "uuid-procedimento-2"]
}
```

## 🛡️ Regras de Negócio

### Usuários
- Email único no sistema
- Tipos: `admin` ou `default`
- Apenas admins podem criar/remover usuários
- Usuários só podem alterar próprios dados
- Não pode remover usuário com atendimentos

### Pacientes
- CPF e email únicos
- Menores de idade requerem responsável
- Responsável deve ser maior de idade
- Não pode remover paciente com atendimentos

### Procedimentos
- Nome único
- Apenas admins podem gerenciar
- Não pode remover se usado em atendimentos

### Atendimentos
- Deve ter pelo menos um procedimento
- Tipo "plano" requer número da carteira
- Valor calculado automaticamente
- Apenas criador ou admin podem editar/remover

## 📊 Status Codes HTTP

- `200` - Sucesso
- `201` - Criado com sucesso  
- `400` - Erro na requisição
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Não encontrado
- `500` - Erro interno

## 🤝 Usuário Padrão

O sistema cria automaticamente um usuário administrador:
- **Email:** admin@clinic.com
- **Senha:** admin123
- **Tipo:** admin

## 📝 Banco de Dados

O sistema utiliza SQLite que é criado automaticamente no arquivo `clinic.db`. Para resetar o banco:

```bash
rm clinic.db
rm -rf migrations/
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
python create_admin.py
```

## 🔄 Comandos Úteis

```bash
# Criar nova migration
flask db migrate -m "Descrição da mudança"

# Aplicar migrations
flask db upgrade

# Resetar usuário admin
python create_admin.py

# Executar em modo debug
FLASK_DEBUG=True python run.py
```