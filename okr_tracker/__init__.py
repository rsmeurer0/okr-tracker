from flask import Flask
from okr_tracker.config import config
from okr_tracker.extensions import db, login_manager, migrate


def create_app(config_name="default"):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)

    from okr_tracker.models import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    from okr_tracker.routes.auth import auth_bp
    from okr_tracker.routes.admin import admin_bp
    from okr_tracker.routes.dashboard import dashboard_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp, url_prefix="/admin")
    app.register_blueprint(dashboard_bp)

    return app
