from datetime import date

import pytest
from flask_jwt_extended import create_access_token, decode_token

from app.models.user import User
from app.models.patient import Patient
from app.utils.auth import hash_password, check_password


@pytest.fixture
def accounts(db_session):
    staff = User(id='same-id', nome='Admin', email='admin@example.com', senha=hash_password('secret12'), tipo='admin')
    patient = Patient(id='same-id', nome='Paciente', email='patient@example.com', senha=hash_password('patient12'), cpf='52998224725', telefone='71999999999', data_nascimento=date(1990, 1, 1), estado='BA', cidade='Salvador', bairro='Centro', cep='40000000', rua='Rua', numero='1')
    regular = User(id='regular', nome='Regular', email='regular@example.com', senha=hash_password('secret12'), tipo='default')
    db_session.add_all([staff, patient, regular])
    db_session.commit()
    return staff, patient, regular


def headers(identity='same-id', account_type='patient'):
    claims = {} if account_type is None else {'account_type': account_type}
    return {'Authorization': 'Bearer ' + create_access_token(identity=identity, additional_claims=claims)}


@pytest.mark.parametrize('body', [None, [], 'invalid', {'email': [], 'senha': {}}, {'email': 'admin@example.com', 'senha': '\ud800'}, {'email': 'admin@example.com', 'senha': 'x' * 73}])
def test_login_rejects_bad_inputs(client, accounts, body):
    response = client.post('/auth/login', json=body)
    assert response.status_code in (400, 401)
    assert 'error' in response.json


@pytest.mark.parametrize('email,password,kind', [('admin@example.com', 'secret12', 'user'), ('patient@example.com', 'patient12', 'patient')])
def test_login_issues_namespaced_token(client, accounts, email, password, kind):
    response = client.post('/auth/login', json={'email': email, 'senha': password})
    assert response.status_code == 200
    assert decode_token(response.json['access_token'])['account_type'] == kind
    assert 'senha' not in response.json['user']


@pytest.mark.parametrize('kind', ['patient', 'invalid', None])
def test_patient_or_ambiguous_legacy_token_cannot_be_admin(client, accounts, kind):
    assert client.get('/users', headers=headers(account_type=kind)).status_code == 403
    assert client.get('/users/search?email=admin@example.com', headers=headers(account_type=kind)).status_code == 403
    assert client.put('/users/same-id', json={'nome': 'Hacked'}, headers=headers(account_type=kind)).status_code == 403
    assert accounts[0].nome == 'Admin'


def test_patient_password_change_targets_patient_despite_shared_id(client, accounts):
    staff, patient, _ = accounts
    response = client.post('/auth/change-password', json={'new_password': 'changed12'}, headers=headers())
    assert response.status_code == 200
    assert check_password('changed12', patient.senha)
    assert not patient.first_access
    assert check_password('secret12', staff.senha)


@pytest.mark.parametrize('current_password', ['incorrect', None, []])
def test_change_password_checks_supplied_current_password(client, accounts, current_password):
    response = client.post('/auth/change-password', json={'new_password': 'changed12', 'current_password': current_password}, headers=headers('regular', 'user'))
    assert response.status_code == 400
    assert check_password('secret12', accounts[2].senha)


def test_profile_password_change_with_correct_current_password(client, accounts):
    response = client.post('/auth/change-password', json={'new_password': 'changed12', 'current_password': 'secret12'}, headers=headers('regular', 'user'))
    assert response.status_code == 200
    assert check_password('changed12', accounts[2].senha)


@pytest.mark.parametrize('password', [None, [], 123456, 'short', 'é' * 37, '\ud800' * 6])
def test_change_password_rejects_invalid_password_without_mutation(client, accounts, password):
    before = accounts[1].senha
    response = client.post('/auth/change-password', json={'new_password': password}, headers=headers())
    assert response.status_code == 400
    assert accounts[1].senha == before


def test_regular_user_cannot_modify_other_user_or_elevate_role(client, accounts):
    auth = headers('regular', 'user')
    assert client.put('/users/same-id', json={'nome': 'Hacked'}, headers=auth).status_code == 400
    assert client.put('/users/regular', json={'tipo': 'admin'}, headers=auth).status_code == 400
    assert accounts[0].nome == 'Admin'
    assert accounts[2].tipo == 'default'


def test_wrong_current_password_does_not_partially_update_user(client, accounts):
    response = client.put('/users/regular', json={'nome': 'Changed', 'email': 'changed@example.com', 'senha': 'newsecret', 'senha_atual': 'incorrect'}, headers=headers('regular', 'user'))
    assert response.status_code == 400
    assert accounts[2].nome == 'Regular'
    assert accounts[2].email == 'regular@example.com'


def test_deleted_subject_and_ambiguous_token_cannot_change_password(client, accounts):
    for auth in (headers('missing', 'user'), headers(account_type=None)):
        assert client.post('/auth/change-password', json={'new_password': 'changed12'}, headers=auth).status_code == 404
    assert check_password('secret12', accounts[0].senha)
    assert check_password('patient12', accounts[1].senha)

@pytest.mark.parametrize('body', [None, [], 'bad', {'nome': 'User', 'email': 'a' * 110 + '@example.com', 'senha': 'secret12'}, {'nome': 'User', 'email': 'new@example.com', 'senha': 'é' * 37}])
def test_admin_create_rejects_invalid_payload(client, accounts, body):
    response = client.post('/users', json=body, headers=headers(account_type='user'))
    assert response.status_code == 400
    assert User.query.count() == 2


@pytest.mark.parametrize('body', [None, [], {'nova_senha': []}, {'nova_senha': 'é' * 37}])
def test_admin_reset_password_rejects_invalid_payload(client, accounts, body):
    response = client.post('/users/regular/reset-password', json=body, headers=headers(account_type='user'))
    assert response.status_code == 400
    assert check_password('secret12', accounts[2].senha)
