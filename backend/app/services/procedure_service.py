from app import db
from app.models.procedure import Procedure

class ProcedureService:
    @staticmethod
    def create_procedure(data):
        """Create a new procedure"""
        # Check if name already exists
        if Procedure.query.filter_by(nome=data['nome']).first():
            return None, "Nome do procedimento já existe"
        
        try:
            procedure = Procedure(
                nome=data['nome'],
                descricao=data.get('descricao', ''),
                valor_plano=data['valor_plano'],
                valor_particular=data['valor_particular']
            )
            
            db.session.add(procedure)
            db.session.commit()
            return procedure, None
        except Exception as e:
            db.session.rollback()
            return None, "Erro ao criar procedimento"
    
    @staticmethod
    def update_procedure(procedure_id, data):
        """Update procedure data"""
        procedure = Procedure.query.get(procedure_id)
        if not procedure:
            return None, "Procedimento não encontrado"
        
        # Check name uniqueness
        if 'nome' in data and data['nome'] != procedure.nome:
            if Procedure.query.filter_by(nome=data['nome']).first():
                return None, "Nome do procedimento já existe"
            procedure.nome = data['nome']
        
        # Update other fields
        fields = ['descricao', 'valor_plano', 'valor_particular']
        for field in fields:
            if field in data:
                setattr(procedure, field, data[field])
        
        try:
            db.session.commit()
            return procedure, None
        except Exception as e:
            db.session.rollback()
            return None, "Erro ao atualizar procedimento"
    
    @staticmethod
    def delete_procedure(procedure_id):
        """Delete procedure if not used in appointments"""
        procedure = Procedure.query.get(procedure_id)
        if not procedure:
            return False, "Procedimento não encontrado"
        
        if procedure.appointments:
            return False, "Não é possível remover procedimento usado em atendimentos"
        
        try:
            db.session.delete(procedure)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, "Erro ao remover procedimento"