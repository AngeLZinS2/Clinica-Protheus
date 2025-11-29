from datetime import datetime
from decimal import Decimal
from app import db
from app.models.appointment import Appointment, AppointmentProcedure
from app.models.patient import Patient
from app.models.procedure import Procedure
from app.services.audit_service import AuditService

class AppointmentService:
    @staticmethod
    def create_appointment(data, user_id):
        """Create a new appointment"""
        # Validate patient exists
        patient = Patient.query.get(data['patient_id'])
        if not patient:
            return None, "Paciente não encontrado"
        
        # Validate procedures exist
        procedure_ids = data.get('procedures', [])
        if not procedure_ids:
            return None, "Pelo menos um procedimento é obrigatório"
        
        procedures = Procedure.query.filter(Procedure.id.in_(procedure_ids)).all()
        if len(procedures) != len(procedure_ids):
            return None, "Um ou mais procedimentos não encontrados"
        
        # Validate appointment type and carteira
        if data['tipo'] == 'plano' and not data.get('numero_carteira'):
            return None, "Número da carteira é obrigatório para tipo 'plano'"
        
        # Calculate total value
        if data['tipo'] == 'plano':
            total_value = sum(proc.valor_plano for proc in procedures)
        else:
            total_value = sum(proc.valor_particular for proc in procedures)
        
        try:
            # Parse date
            data_hora = datetime.fromisoformat(data['data_hora'])
        except ValueError:
            return None, "Formato de data/hora inválido (use ISO format)"
        
        appointment = Appointment(
            data_hora=data_hora,
            patient_id=data['patient_id'],
            user_id=user_id,
            tipo=data['tipo'],
            numero_carteira=data.get('numero_carteira'),
            valor_total=total_value
        )
        
        try:
            db.session.add(appointment)
            db.session.flush()  # Get appointment ID
            
            # Add procedures
            for procedure in procedures:
                appointment.procedures.append(procedure)
            
            db.session.commit()
            
            # Audit Log
            AuditService.log_action(
                user_id=user_id,
                action='CREATE',
                table_name='appointments',
                record_id=appointment.id,
                new_values=appointment.to_dict(),
                details=f"Atendimento criado para paciente {patient.nome}"
            )
            
            return appointment, None
        except Exception as e:
            db.session.rollback()
            return None, "Erro ao criar atendimento"
    
    @staticmethod
    def update_appointment(appointment_id, data, current_user):
        """Update appointment (only creator or admin)"""
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return None, "Atendimento não encontrado"
        
        # Check permissions
        if appointment.user_id != current_user.id and current_user.tipo != 'admin':
            return None, "Sem permissão para alterar este atendimento"
        
        old_values = appointment.to_dict()
        
        # Update data_hora
        if 'data_hora' in data:
            try:
                appointment.data_hora = datetime.fromisoformat(data['data_hora'])
            except ValueError:
                return None, "Formato de data/hora inválido"
        
        # Update tipo and carteira
        if 'tipo' in data:
            appointment.tipo = data['tipo']
        
        if 'numero_carteira' in data:
            appointment.numero_carteira = data['numero_carteira']
        
        # Validate carteira for plano type
        if appointment.tipo == 'plano' and not appointment.numero_carteira:
            return None, "Número da carteira é obrigatório para tipo 'plano'"
        
        # Update procedures if provided
        if 'procedures' in data:
            procedure_ids = data['procedures']
            if not procedure_ids:
                return None, "Pelo menos um procedimento é obrigatório"
            
            procedures = Procedure.query.filter(Procedure.id.in_(procedure_ids)).all()
            if len(procedures) != len(procedure_ids):
                return None, "Um ou mais procedimentos não encontrados"
            
            # Update procedures and recalculate total
            appointment.procedures = procedures
            
            if appointment.tipo == 'plano':
                appointment.valor_total = sum(proc.valor_plano for proc in procedures)
            else:
                appointment.valor_total = sum(proc.valor_particular for proc in procedures)
        
        try:
            db.session.commit()
            
            # Audit Log
            AuditService.log_action(
                user_id=current_user.id,
                action='UPDATE',
                table_name='appointments',
                record_id=appointment.id,
                old_values=old_values,
                new_values=appointment.to_dict(),
                details=f"Atendimento atualizado"
            )
            
            return appointment, None
        except Exception as e:
            db.session.rollback()
            return None, "Erro ao atualizar atendimento"
    
    @staticmethod
    def delete_appointment(appointment_id, current_user):
        """Delete appointment (only creator or admin)"""
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return False, "Atendimento não encontrado"
        
        # Check permissions
        if appointment.user_id != current_user.id and current_user.tipo != 'admin':
            return False, "Sem permissão para remover este atendimento"
        
        old_values = appointment.to_dict()
        
        try:
            db.session.delete(appointment)
            db.session.commit()
            
            # Audit Log
            AuditService.log_action(
                user_id=current_user.id,
                action='DELETE',
                table_name='appointments',
                record_id=appointment_id,
                old_values=old_values,
                details=f"Atendimento removido"
            )
            
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, "Erro ao remover atendimento"