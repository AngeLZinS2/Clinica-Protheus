import uuid
from datetime import datetime
from decimal import Decimal
from app import db

class Procedure(db.Model):
    __tablename__ = 'procedures'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nome = db.Column(db.String(100), unique=True, nullable=False)
    descricao = db.Column(db.Text)
    valor_plano = db.Column(db.Numeric(10, 2), nullable=False)
    valor_particular = db.Column(db.Numeric(10, 2), nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'descricao': self.descricao,
            'valor_plano': float(self.valor_plano),
            'valor_particular': float(self.valor_particular),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }