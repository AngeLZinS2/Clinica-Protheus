# Clínica Protheus

Sistema full stack de gestão clínica criado para centralizar pacientes, consultas, procedimentos e rotinas administrativas em uma experiência segura e responsiva.

[![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![Flask](https://img.shields.io/badge/Flask-2.3-111827?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)

**Aplicação online:** [173.212.251.120:8083](http://173.212.251.120:8083)

Use o botão **Preview com dados de demonstração** para explorar o sistema sem cadastro. Os dados e as alterações desse modo ficam isolados no navegador e não afetam o banco de produção.

## Sobre o projeto

A Clínica Protheus transforma processos comuns de uma clínica em um fluxo único: cadastro de pacientes, organização da agenda, acompanhamento de procedimentos e visão gerencial. A interface foi desenhada para funcionar bem no computador e no celular, com temas claro e escuro, navegação acessível e uma experiência de login com DNA interativo em 3D.

### Principais recursos

- autenticação JWT e troca obrigatória de senha no primeiro acesso;
- perfis de administrador, médico, recepcionista e paciente;
- cadastro e acompanhamento de pacientes;
- agendamento, atualização e cancelamento de consultas;
- gestão de procedimentos clínicos;
- painel com indicadores operacionais;
- área do paciente e edição de perfil;
- trilha de auditoria para ações relevantes;
- paginação, validação de dados e respostas padronizadas da API;
- interface responsiva, acessível e compatível com movimento reduzido.
- modo Preview com dados simulados para apresentação do portfólio.

## Arquitetura

```text
Navegador
   │
   ▼
Nginx + React/Vite  ── /api ──▶  Flask + Gunicorn  ──▶  PostgreSQL 16
```

O ambiente de produção roda com Docker Compose. O Nginx entrega o frontend e encaminha as chamadas da API para o backend, enquanto o PostgreSQL mantém os dados em volume persistente.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, React Three Fiber, Lucide |
| Backend | Python, Flask, SQLAlchemy, Marshmallow, Flask-JWT-Extended, Gunicorn |
| Banco de dados | PostgreSQL 16 |
| Infraestrutura | Docker Compose, Nginx |
| Qualidade | Pytest, ESLint |

## Como executar com Docker

### Pré-requisitos

- Docker Engine com Docker Compose
- Git

### Instalação

```bash
git clone https://github.com/AngeLZinS2/Clinica-Protheus.git
cd Clinica-Protheus
cp .env.example .env
```

Preencha as variáveis do `.env` com valores seguros:

```env
POSTGRES_PASSWORD=uma_senha_forte
JWT_SECRET_KEY=uma_chave_secreta_longa
HTTP_PORT=8083
```

Depois, inicie os serviços:

```bash
docker compose up -d --build
```

A aplicação estará disponível em `http://localhost:8083`.

## Desenvolvimento local

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask run
```

No Windows PowerShell, ative o ambiente com `.venv\Scripts\Activate.ps1`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Validação

```bash
cd backend
pytest

cd ../frontend
npm run lint
npm run build
```

## Autor

Desenvolvido por **Angelo Neri**.

- [GitHub](https://github.com/AngeLZinS2)
- [LinkedIn](https://www.linkedin.com/in/angelo-neri-3921a72b9/)
- [Portfólio PlayDB](https://playdb.info/)

## Licença

Projeto desenvolvido para fins de portfólio e demonstração técnica.
