import pytest
from okr_tracker import create_app
from okr_tracker.extensions import db as _db
from okr_tracker.models import Organization, User


@pytest.fixture(scope="session")
def app():
    app = create_app("testing")
    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()


@pytest.fixture(scope="function")
def db(app):
    with app.app_context():
        yield _db
        _db.session.rollback()
        for table in reversed(_db.metadata.sorted_tables):
            _db.session.execute(table.delete())
        _db.session.commit()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def sample_org(db):
    org = Organization(name="Acme Corp", slug="acme")
    db.session.add(org)
    db.session.commit()
    return org


@pytest.fixture
def super_admin(db):
    user = User(name="Super Admin", email="admin@example.com", role="super_admin")
    user.set_password("password")
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def org_member(db, sample_org):
    user = User(name="Jane Doe", email="jane@acme.com", org_id=sample_org.id, role="member")
    user.set_password("password")
    db.session.add(user)
    db.session.commit()
    return user
