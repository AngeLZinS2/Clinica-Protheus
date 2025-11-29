"""
Script para criar usuário administrador padrão
Execute: python create_admin.py
"""
from app import create_app, db
from app.models.user import User
from app.utils.auth import hash_password
from config import Config

def create_admin_user():
    app = create_app(Config)
    
    with app.app_context():
        # Verificar se admin já existe
        admin = User.query.filter_by(email='admin@clinic.com').first()
        
        if admin:
            print("Usuário administrador já existe!")
            return
        
        # Criar usuário admin
        admin_user = User(
            nome='Administrador',
            email='admin@clinic.com',
            senha=hash_password('admin123'),
            tipo='admin'
        )
        
        try:
            db.session.add(admin_user)
            db.session.commit()
            print("Usuário administrador criado com sucesso!")
            print("Email: admin@clinic.com")
            print("Senha: admin123")
        except Exception as e:
            db.session.rollback()
            print(f"Erro ao criar usuário administrador: {e}")

if __name__ == '__main__':
    create_admin_user()