from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_class):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Initialize Marshmallow
    from app.schemas import ma
    ma.init_app(app)
    
    # Enable CORS
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    
    # Register blueprints (controllers)
    from app.controllers.auth import auth_bp
    from app.controllers.users import users_bp
    from app.controllers.patients import patients_bp
    from app.controllers.procedures import procedures_bp
    from app.controllers.appointments import appointments_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(users_bp, url_prefix='/users')
    app.register_blueprint(patients_bp, url_prefix='/patients')
    app.register_blueprint(procedures_bp, url_prefix='/procedures')
    app.register_blueprint(appointments_bp, url_prefix='/appointments')
    
    from app.controllers.dashboard import dashboard_bp
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')

    from app.controllers.audit import audit_bp
    app.register_blueprint(audit_bp, url_prefix='/audit')
    
    return app