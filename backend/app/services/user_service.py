from app import db
from app.models.user import User
from app.utils.auth import hash_password, check_password, valid_password
from app.utils.validators import validate_email

class UserService:
    @staticmethod
    def create_user(data):
        """Create a new user"""
        # Validate email format
        if not validate_email(data['email']):
            return None, "Formato de email inválido"
        
        # Check if email already exists
        if User.query.filter_by(email=data['email']).first():
            return None, "Email já está em uso"
        
        if not valid_password(data.get('senha')):
            return None, "Senha deve ter pelo menos 6 caracteres e no máximo 72 bytes"

        # Hash password
        hashed_password = hash_password(data['senha'])
        
        user = User(
            nome=data['nome'],
            email=data['email'],
            senha=hashed_password,
            tipo=data.get('tipo', 'default')
        )
        
        try:
            db.session.add(user)
            db.session.commit()
            return user, None
        except Exception as e:
            db.session.rollback()
            return None, "Erro ao criar usuário"
    
    @staticmethod
    def update_user(user_id, data, current_user):
        """Update user data"""
        user = User.query.get(user_id)
        if not user:
            return None, "Usuário não encontrado"
        
        # Check permissions
        if not isinstance(current_user, User):
            return None, "Sem permissão para alterar este usuário"
        if user.id != current_user.id and current_user.tipo != 'admin':
            return None, "Sem permissão para alterar este usuário"
        
        # Validate before mutating any fields.
        if 'senha' in data:
            if not valid_password(data['senha']):
                return None, "Senha deve ter pelo menos 6 caracteres e no máximo 72 bytes"
            if not check_password(data.get('senha_atual'), user.senha):
                return None, "Senha atual incorreta"

        # Check email uniqueness
        if 'email' in data and data['email'] != user.email:
            if not validate_email(data['email']):
                return None, "Formato de email inválido"
            if User.query.filter_by(email=data['email']).first():
                return None, "Email já está em uso"
            user.email = data['email']
        
        if 'nome' in data:
            user.nome = data['nome']
        
        if 'senha' in data:
            user.senha = hash_password(data['senha'])

        try:
            db.session.commit()
            return user, None
        except Exception as e:
            db.session.rollback()
            return None, "Erro ao atualizar usuário"
    
    @staticmethod
    def delete_user(user_id, current_user):
        """Delete user (admin only, if no appointments)"""
        if not isinstance(current_user, User) or current_user.tipo != 'admin':
            return False, "Apenas administradores podem remover usuários"
        
        user = User.query.get(user_id)
        if not user:
            return False, "Usuário não encontrado"
        
        if user.appointments:
            return False, "Não é possível remover usuário com atendimentos"
        
        try:
            db.session.delete(user)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, "Erro ao remover usuário"
    
    @staticmethod
    def reset_password(user_id, new_password, current_user):
        """Reset user password (admin only)"""
        if not isinstance(current_user, User) or current_user.tipo != 'admin':
            return None, "Apenas administradores podem resetar senhas"
        
        user = User.query.get(user_id)
        if not user:
            return None, "Usuário não encontrado"
        
        if not valid_password(new_password):
            return None, "Senha deve ter pelo menos 6 caracteres e no máximo 72 bytes"
        user.senha = hash_password(new_password)
        
        try:
            db.session.commit()
            return user, None
        except Exception as e:
            db.session.rollback()
            return None, "Erro ao resetar senha"