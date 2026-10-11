from pathlib import Path

import pytest
from flask_migrate import upgrade, downgrade
from sqlalchemy import inspect

from app import create_app, db
from app.services.audit_service import AuditService


def test_health(client):
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json == {'status': 'ok'}


@pytest.mark.parametrize('secret', [None, '', 'your-secret-key-here'])
def test_rejects_known_or_missing_secret(secret):
    class UnsafeConfig:
        JWT_SECRET_KEY = secret
        SQLALCHEMY_DATABASE_URI = 'sqlite://'
    with pytest.raises(RuntimeError, match='JWT_SECRET_KEY'):
        create_app(UnsafeConfig)


def test_audit_does_not_trust_forwarded_header(app):
    with app.test_request_context('/', headers={'X-Forwarded-For': 'x' * 500}, environ_base={'REMOTE_ADDR': '127.0.0.1'}):
        log = AuditService.log_action(None, 'TEST')
        assert log is not None
        assert log.ip_address == '127.0.0.1'


def test_migrations_round_trip(app):
    db.drop_all()
    directory = str(Path(__file__).resolve().parents[1] / 'migrations')
    upgrade(directory=directory)
    assert 'audit_logs' in inspect(db.engine).get_table_names()
    assert 'senha' in {column['name'] for column in inspect(db.engine).get_columns('patients')}
    downgrade(directory=directory, revision='base')
    assert 'patients' not in inspect(db.engine).get_table_names()
    upgrade(directory=directory)


def test_postgresql_migration_sql(capsys):
    class OfflineConfig:
        TESTING = True
        JWT_SECRET_KEY = 'isolated-test-secret-at-least-32-bytes'
        SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg://unused:unused@127.0.0.1:1/unused'
        SQLALCHEMY_TRACK_MODIFICATIONS = False
    application = create_app(OfflineConfig)
    with application.app_context():
        upgrade(directory=str(Path(__file__).resolve().parents[1] / 'migrations'), sql=True)
        sql = capsys.readouterr().out
        assert 'CREATE TABLE patients' in sql
        assert 'CREATE TABLE audit_logs' in sql
        assert 'ALTER TABLE patients ADD COLUMN senha' in sql
        db.engine.dispose()
