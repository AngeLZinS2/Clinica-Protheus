# Backend - Clínica Protheus

API REST desenvolvida em Flask seguindo o padrão MVC.

## Estrutura

```
backend/
├── app/
│   ├── models/         # Modelos de dados
│   ├── schemas/        # Schemas Marshmallow
│   ├── controllers/    # Controllers (rotas)
│   ├── services/       # Lógica de negócio
│   └── utils/          # Utilitários
├── migrations/         # Migrações do banco
├── instance/           # Banco de dados SQLite
├── config.py           # Configurações
├── run.py              # Entry point
└── requirements.txt    # Dependências
```

## Instalação

```bash
pip install -r requirements.txt
```

## Configuração

1. Copie `.env.example` para `.env`
2. Configure as variáveis de ambiente

## Executar

```bash
python run.py
```

Servidor: `http://localhost:5000`

## Criar Admin

```bash
python create_admin.py
```

## Endpoints

- `POST /auth/login` - Login
- `GET /users` - Listar usuários
- `GET /patients` - Listar pacientes
- `GET /appointments` - Listar atendimentos
- `GET /procedures` - Listar procedimentos
- `GET /dashboard/stats` - Estatísticas
- `GET /audit` - Logs de auditoria

## Tecnologias

- Flask
- SQLAlchemy
- Marshmallow
- Flask-JWT-Extended
- SQLite
