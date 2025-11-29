from datetime import date
from app import db
from app.models.patient import Patient, Responsible
from app.utils.validators import validate_cpf, validate_email, calculate_age
from app.utils.auth import hash_password

class PatientService:
    @staticmethod
    def create_patient(data):
        """Create a new patient"""
        # Validate CPF
        if not validate_cpf(data['cpf']):
            return None, "CPF inválido"
        
        # Check if CPF already exists
        if Patient.query.filter_by(cpf=data['cpf']).first():
            return None, "CPF já está em uso"
        
        # Validate email
        if not validate_email(data['email']):
            return None, "Formato de email inválido"
        
        # Check if email already exists
        if Patient.query.filter_by(email=data['email']).first():
            return None, "Email já está em uso"
        
        # Parse birth date
        try:
            birth_date = date.fromisoformat(data['data_nascimento'])
        except ValueError:
            return None, "Formato de data inválido (use YYYY-MM-DD)"
        
        # Strip CPF formatting
        import re
        clean_cpf = re.sub(r'\D', '', data['cpf'])
        
        # Create patient with default password (CPF)
        patient = Patient(
            cpf=clean_cpf,
            nome=data['nome'],
            email=data['email'],
            senha=hash_password(clean_cpf),  # Default password is cleaned CPF
            first_access=True,
            telefone=data['telefone'],
            data_nascimento=birth_date,
            estado=data['endereco']['estado'],
            cidade=data['endereco']['cidade'],
            bairro=data['endereco']['bairro'],
            cep=data['endereco']['cep'],
            rua=data['endereco']['rua'],
            numero=data['endereco']['numero']
        )
        
        # If patient is minor, responsible is required
        if calculate_age(birth_date) < 18:
            if 'responsible' not in data:
                return None, "Paciente menor de idade requer dados do responsável"
            
            responsible_data = data['responsible']
            
            # Validate responsible CPF
            if not validate_cpf(responsible_data['cpf']):
                return None, "CPF do responsável inválido"
            
            # Validate responsible email
            if not validate_email(responsible_data['email']):
                return None, "Email do responsável inválido"
            
            # Check if responsible is minor
            try:
                responsible_birth = date.fromisoformat(responsible_data['data_nascimento'])
                if calculate_age(responsible_birth) < 18:
                    return None, "Responsável não pode ser menor de idade"
            except ValueError:
                return None, "Data de nascimento do responsável inválida"
            
            responsible = Responsible(
                nome=responsible_data['nome'],
                cpf=responsible_data['cpf'],
                data_nascimento=responsible_birth,
                email=responsible_data['email'],
                telefone=responsible_data['telefone']
            )
            
            patient.responsible = responsible
        
        try:
            db.session.add(patient)
            db.session.commit()
            return patient, None
        except Exception as e:
            db.session.rollback()
            return None, "Erro ao criar paciente"
    
    @staticmethod
    def update_patient(patient_id, data):
        """Update patient data"""
        patient = Patient.query.get(patient_id)
        if not patient:
            return None, "Paciente não encontrado"
        
        # Check CPF uniqueness
        if 'cpf' in data and data['cpf'] != patient.cpf:
            if not validate_cpf(data['cpf']):
                return None, "CPF inválido"
            
            import re
            clean_cpf = re.sub(r'\D', '', data['cpf'])
            
            if Patient.query.filter_by(cpf=clean_cpf).first():
                return None, "CPF já está em uso"
            patient.cpf = clean_cpf
        
        # Check email uniqueness
        if 'email' in data and data['email'] != patient.email:
            if not validate_email(data['email']):
                return None, "Email inválido"
            if Patient.query.filter_by(email=data['email']).first():
                return None, "Email já está em uso"
            patient.email = data['email']
        
        # Update other fields
        fields = ['nome', 'telefone']
        for field in fields:
            if field in data:
                setattr(patient, field, data[field])
        
        if 'data_nascimento' in data:
            try:
                patient.data_nascimento = date.fromisoformat(data['data_nascimento'])
            except ValueError:
                return None, "Formato de data inválido"
        
        # Update address
        if 'endereco' in data:
            address = data['endereco']
            address_fields = ['estado', 'cidade', 'bairro', 'cep', 'rua', 'numero']
            for field in address_fields:
                if field in address:
                    setattr(patient, field, address[field])
        
        # Update responsible if provided
        if 'responsible' in data:
            responsible_data = data['responsible']
            
            if patient.responsible:
                # Update existing responsible
                responsible = patient.responsible
                if 'cpf' in responsible_data and not validate_cpf(responsible_data['cpf']):
                    return None, "CPF do responsável inválido"
                if 'email' in responsible_data and not validate_email(responsible_data['email']):
                    return None, "Email do responsável inválido"
                
                for field in ['nome', 'cpf', 'email', 'telefone']:
                    if field in responsible_data:
                        setattr(responsible, field, responsible_data[field])
                
                if 'data_nascimento' in responsible_data:
                    try:
                        birth_date = date.fromisoformat(responsible_data['data_nascimento'])
                        if calculate_age(birth_date) < 18:
                            return None, "Responsável não pode ser menor de idade"
                        responsible.data_nascimento = birth_date
                    except ValueError:
                        return None, "Data de nascimento do responsável inválida"
            else:
                # Create new responsible
                if not validate_cpf(responsible_data['cpf']):
                    return None, "CPF do responsável inválido"
                if not validate_email(responsible_data['email']):
                    return None, "Email do responsável inválido"
                
                try:
                    birth_date = date.fromisoformat(responsible_data['data_nascimento'])
                    if calculate_age(birth_date) < 18:
                        return None, "Responsável não pode ser menor de idade"
                except ValueError:
                    return None, "Data de nascimento do responsável inválida"
                
                responsible = Responsible(
                    nome=responsible_data['nome'],
                    cpf=responsible_data['cpf'],
                    data_nascimento=birth_date,
                    email=responsible_data['email'],
                    telefone=responsible_data['telefone']
                )
                patient.responsible = responsible
        
        try:
            db.session.commit()
            return patient, None
        except Exception as e:
            db.session.rollback()
            return None, "Erro ao atualizar paciente"
    
    @staticmethod
    def delete_patient(patient_id):
        """Delete patient if no appointments"""
        patient = Patient.query.get(patient_id)
        if not patient:
            return False, "Paciente não encontrado"
        
        # if patient.appointments:
        #     return False, "Não é possível remover paciente com atendimentos"
        
        try:
            db.session.delete(patient)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, "Erro ao remover paciente"