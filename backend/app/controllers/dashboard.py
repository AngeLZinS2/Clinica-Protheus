from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from datetime import date, datetime
from sqlalchemy import extract, func
from app import db
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.procedure import Procedure

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        today = date.today()
        current_month = today.month
        current_year = today.year

        # Total Patients
        total_patients = Patient.query.count()

        # Appointments Today
        # SQLite specific date comparison might be needed if using SQLite, but func.date usually works
        appointments_today = Appointment.query.filter(
            func.date(Appointment.data_hora) == today
        ).count()

        # Total Procedures
        total_procedures = Procedure.query.count()

        # Monthly Revenue
        monthly_revenue = db.session.query(func.sum(Appointment.valor_total)).filter(
            extract('month', Appointment.data_hora) == current_month,
            extract('year', Appointment.data_hora) == current_year
        ).scalar() or 0

        return jsonify({
            'total_patients': total_patients,
            'appointments_today': appointments_today,
            'total_procedures': total_procedures,
            'monthly_revenue': float(monthly_revenue)
        }), 200

    except Exception as e:
        print(f"Error getting dashboard stats: {e}")
        return jsonify({'error': 'Erro ao carregar estatísticas'}), 500
