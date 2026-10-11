from decimal import Decimal
import pytest
from flask_jwt_extended import create_access_token
from marshmallow import ValidationError
from app.models.user import User
from app.models.procedure import Procedure
from app.schemas.procedure_schema import ProcedureCreateSchema, ProcedureUpdateSchema


@pytest.mark.parametrize('value', ['NaN', 'Infinity', '-Infinity', '-0.01', '100000000', '99999999.999', '1e999999', 'not-money', None])
@pytest.mark.parametrize('schema_cls', [ProcedureCreateSchema, ProcedureUpdateSchema])
def test_procedure_rejects_invalid_money(value, schema_cls):
    with pytest.raises(ValidationError):
        schema_cls().load(dict(nome='Consulta', valor_plano=value, valor_particular='10.00'))


@pytest.mark.parametrize('name', ['', '   ', '\t\n'])
def test_procedure_rejects_blank_name(name):
    with pytest.raises(ValidationError):
        ProcedureCreateSchema().load(dict(nome=name, valor_plano=0, valor_particular=10))


def test_procedure_decimal_precision():
    result = ProcedureCreateSchema().load(dict(nome='Consulta', valor_plano='0.10', valor_particular='99999999.99'))
    assert result['valor_plano'] == Decimal('0.10')
    assert result['valor_particular'] == Decimal('99999999.99')


@pytest.fixture
def admin_headers(db_session):
    user = User(nome='Admin', email='admin@test.invalid', senha='unused', tipo='admin')
    db_session.add(user)
    db_session.commit()
    return {'Authorization': 'Bearer ' + create_access_token(identity=user.id, additional_claims={'account_type': 'user'})}


@pytest.mark.parametrize('query,expected', [('limit=0&page=0', (1, 1)), ('limit=-1&page=-4', (1, 1)), ('limit=9999', (1, 100)), ('limit=oops&page=oops', (1, 10))])
def test_pagination_bounds(client, admin_headers, query, expected):
    response = client.get('/procedures?' + query, headers=admin_headers)
    assert response.status_code == 200
    pagination = response.json['pagination']
    assert (pagination['page'], pagination['per_page']) == expected


@pytest.mark.parametrize('path', ['/procedures', '/procedures/missing'])
def test_deleted_account_cannot_read_catalogue(client, path):
    headers = {'Authorization': 'Bearer ' + create_access_token(identity='deleted', additional_claims={'account_type': 'user'})}
    assert client.get(path, headers=headers).status_code == 401


def test_procedure_crud_and_duplicate_rollback(client, admin_headers, db_session):
    payload = dict(nome='Consulta', valor_plano='0.10', valor_particular='125.50')
    response = client.post('/procedures', json=payload, headers=admin_headers)
    assert response.status_code == 201
    procedure_id = response.json['id']
    assert Decimal(str(response.json['valor_plano'])) == Decimal('0.10')
    assert client.post('/procedures', json=payload, headers=admin_headers).status_code == 400
    assert db_session.query(Procedure).count() == 1
    response = client.put('/procedures/' + procedure_id, json={'valor_plano': '-1'}, headers=admin_headers)
    assert response.status_code == 400
    assert db_session.get(Procedure, procedure_id).valor_plano == Decimal('0.10')
    assert client.delete('/procedures/' + procedure_id, headers=admin_headers).status_code == 200


def test_patient_can_read_but_cannot_modify_catalogue(client, db_session):
    from datetime import date
    from app.models.patient import Patient
    patient = Patient(cpf='52998224725', nome='Patient', email='patient@test.invalid',
                      senha='unused', telefone='11999999999', data_nascimento=date(1990, 1, 1),
                      estado='SP', cidade='City', bairro='Area', cep='12345678', rua='Street', numero='1')
    procedure = Procedure(nome='Consulta', valor_plano=Decimal('10'), valor_particular=Decimal('20'))
    db_session.add_all([patient, procedure])
    db_session.commit()
    headers = {'Authorization': 'Bearer ' + create_access_token(identity=patient.id, additional_claims={'account_type': 'patient'})}
    assert client.get('/procedures', headers=headers).status_code == 200
    assert client.get('/procedures/' + procedure.id, headers=headers).status_code == 200
    assert client.post('/procedures', json={}, headers=headers).status_code == 403
    assert client.put('/procedures/' + procedure.id, json={'nome': 'Changed'}, headers=headers).status_code == 403
    assert client.delete('/procedures/' + procedure.id, headers=headers).status_code == 403
