from okr_tracker.models import Organization, User, Objective, KeyResult


def test_create_org(db):
    org = Organization(name="Test Corp", slug="test-corp")
    db.session.add(org)
    db.session.commit()
    assert org.id is not None
    assert org.primary_color == "#0d6efd"


def test_create_user(db, sample_org):
    user = User(name="John", email="john@test.com", org_id=sample_org.id)
    user.set_password("secret")
    db.session.add(user)
    db.session.commit()
    assert user.check_password("secret")
    assert not user.check_password("wrong")
    assert user.role == "member"


def test_super_admin_role(db, super_admin):
    assert super_admin.is_super_admin
    assert super_admin.is_org_admin


def test_objective_progress_no_key_results(db, sample_org, org_member):
    obj = Objective(title="Grow revenue", org_id=sample_org.id, owner_id=org_member.id)
    db.session.add(obj)
    db.session.commit()
    assert obj.progress == 0


def test_objective_progress_with_key_results(db, sample_org, org_member):
    obj = Objective(title="Grow revenue", org_id=sample_org.id, owner_id=org_member.id)
    db.session.add(obj)
    db.session.flush()
    kr = KeyResult(objective_id=obj.id, title="Revenue", target_value=100, current_value=50, unit="%")
    db.session.add(kr)
    db.session.commit()
    assert obj.progress == 50
