from datetime import date, datetime
from decimal import Decimal
import pytest
from flask_jwt_extended import create_access_token
from app.models.user import User
from app.models.patient import Patient
from app.models.procedure import Procedure
from app.models.appointment import Appointment
from app.models.audit_log import AuditLog


def headers(account, kind):
    return {'Authorization': 'Bearer ' + create_access_token(identity=account.id, additional_claims={'account_type': kind})}


@pytest.fixture
def records(db_session):
    user = User(nome='Staff', email='staff@example.com', senha='unused', tipo='default')
    other = User(nome='Other', email='other@example.com', senha='unused', tipo='default')
    patients = [Patient(cpf=cpf, nome='Patient', email=email, senha='unused', telefone='71999999999', data_nascimento=date(1990,1,1), estado='BA', cidade='City', bairro='Area', cep='40000000', rua='Street', numero='1') for cpf,email in [('52998224725','p1@example.com'),('11144477735','p2@example.com')]]
    procedure=Procedure(nome='Exam', valor_plano=Decimal('30'), valor_particular=Decimal('90'))
    db_session.add_all([user, other, procedure]+patients)
    db_session.flush()
    appointments=[Appointment(patient_id=p.id,user_id=user.id,data_hora=datetime(2026,10,10,10),tipo='particular',valor_total=90,procedures=[procedure]) for p in patients]
    db_session.add_all(appointments)
    db_session.commit()
    return user, other, patients, procedure, appointments


def test_patient_isolation_and_self_profile(client, records):
    user,other,patients,procedure,appointments=records
    auth=headers(patients[0],'patient')
    assert client.get('/patients',headers=auth).status_code==403
    assert client.get('/dashboard/stats',headers=auth).status_code==403
    assert client.get('/patients/'+patients[1].id,headers=auth).status_code==403
    assert client.put('/patients/'+patients[1].id,json={'nome':'intrusion'},headers=auth).status_code==403
    assert client.delete('/patients/'+patients[1].id,headers=auth).status_code==403
    assert client.post('/patients',json={},headers=auth).status_code==403
    assert client.get('/appointments/'+appointments[1].id,headers=auth).status_code==404
    result=client.get('/appointments',headers=auth)
    assert [item['id'] for item in result.json['items']]==[appointments[0].id]
    assert client.get('/appointments/'+appointments[0].id,headers=auth).status_code==200
    assert client.put('/patients/'+patients[0].id,json={'nome':'My profile'},headers=auth).status_code==200
    assert client.put('/appointments/'+appointments[0].id,json={},headers=auth).status_code==403
    assert client.delete('/appointments/'+appointments[0].id,headers=auth).status_code==403
    assert client.post('/appointments',json={},headers=auth).status_code==403


def test_appointment_frontend_contract_audit_and_reprice(client,records):
    user,other,patients,procedure,appointments=records
    auth=headers(user,'user')
    payload={'patient_id':patients[0].id,'data_hora':'2026-10-11T09:00:00','tipo':'particular','procedures':[procedure.id],'user_id':other.id}
    result=client.post('/appointments',json=payload,headers=auth)
    assert result.status_code==201, result.json
    assert result.json['user_id']==user.id
    assert result.json['user_nome']=='Staff'
    ident=result.json['id']
    assert AuditLog.query.filter_by(record_id=ident,action='CREATE').count()==1
    result=client.put('/appointments/'+ident,json={'tipo':'plano','numero_carteira':'123'},headers=auth)
    assert result.status_code==200, result.json
    assert float(result.json['valor_total'])==30
    assert client.put('/appointments/'+ident,json={'tipo':'invalid'},headers=auth).status_code==400
    assert client.put('/appointments/'+ident,json={'procedures':[]},headers=auth).status_code==400
    assert client.put('/appointments/'+ident,json={'tipo':'particular'},headers=headers(other,'user')).status_code==400
    assert client.delete('/appointments/'+ident,headers=auth).status_code==200
    assert AuditLog.query.filter_by(record_id=ident,action='DELETE').count()==1


def test_patient_frontend_creation_address_and_protected_history(client,records):
    user,other,patients,procedure,appointments=records
    auth=headers(user,'user')
    payload={'nome':'New patient','cpf':'12345678909','email':'new@example.com','telefone':'71999999999','data_nascimento':'1990-01-01','endereco':{'estado':'BA','cidade':'City','bairro':'Area','cep':'40000000','rua':'Street','numero':'1'}}
    result=client.post('/patients',json=payload,headers=auth)
    assert result.status_code==201, result.json
    assert result.json['endereco']==payload['endereco']
    ident=result.json['id']
    assert client.put('/patients/'+ident,json={'cpf':'39053344705'},headers=auth).status_code==200
    assert client.get('/patients/'+ident,headers=auth).json['cpf']=='39053344705'
    assert client.put('/patients/'+ident,json={'data_nascimento':'1991-02-03','endereco':{'numero':'2'}},headers=auth).status_code==200
    assert client.delete('/patients/'+patients[0].id,headers=auth).status_code==400
    assert Appointment.query.filter_by(patient_id=patients[0].id).count()==1
    assert client.delete('/patients/'+ident,headers=auth).status_code==200


def test_deleted_identity_denied(client,app):
    auth={'Authorization':'Bearer '+create_access_token(identity='missing',additional_claims={'account_type':'user'})}
    for path in ['/patients','/appointments','/dashboard/stats']:
        assert client.get(path,headers=auth).status_code==403

def test_total_precision_guard_and_failed_update_rollback(client,records,db_session):
    user,other,patients,procedure,appointments=records
    auth=headers(user,'user')
    procedure.valor_particular=Decimal('60000000')
    extra=Procedure(nome='Expensive',valor_plano=1,valor_particular=Decimal('60000000'))
    db_session.add(extra)
    db_session.commit()
    data={'patient_id':patients[0].id,'data_hora':'2026-10-11T09:00:00','tipo':'particular','procedures':[procedure.id,extra.id]}
    assert client.post('/appointments',json=data,headers=auth).status_code==400
    ident=appointments[0].id
    original=appointments[0].data_hora
    assert client.put('/appointments/'+ident,json={'data_hora':'2026-11-11T09:00:00','procedures':[procedure.id,extra.id]},headers=auth).status_code==400
    db_session.expire_all()
    assert db_session.get(Appointment,ident).data_hora==original
    assert len(db_session.get(Appointment,ident).procedures)==1

def test_minor_requires_adult_responsible_and_accepts_typed_dates(client,records):
    user,other,patients,procedure,appointments=records
    auth=headers(user,'user')
    payload={'nome':'Minor','cpf':'12345678909','email':'minor@example.com','telefone':'71999999999','data_nascimento':date.today().isoformat(),'endereco':{'estado':'BA','cidade':'City','bairro':'Area','cep':'40000000','rua':'Street','numero':'1'}}
    assert client.post('/patients',json=payload,headers=auth).status_code==400
    payload['responsible']={'nome':'Parent','cpf':'39053344705','email':'parent@example.com','telefone':'71999999999','data_nascimento':'1990-01-01'}
    response=client.post('/patients',json=payload,headers=auth)
    assert response.status_code==201, response.json
    assert response.json['responsible']['data_nascimento']=='1990-01-01'
    data={'patient_id':patients[0].id,'data_hora':'2026-10-11T09:00:00','tipo':'particular','procedure_ids':[procedure.id]}
    assert client.post('/appointments',json=data,headers=auth).status_code==201
