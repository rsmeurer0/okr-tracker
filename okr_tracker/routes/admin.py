from flask import Blueprint, render_template, redirect, url_for, flash, request, abort
from flask_login import login_required, current_user
from okr_tracker.extensions import db
from okr_tracker.models import Organization, User

admin_bp = Blueprint("admin", __name__)


def require_super_admin():
    if not current_user.is_authenticated or not current_user.is_super_admin:
        abort(403)


@admin_bp.route("/")
@login_required
def index():
    require_super_admin()
    orgs = Organization.query.order_by(Organization.name).all()
    return render_template("admin/index.html", orgs=orgs)


@admin_bp.route("/orgs/new", methods=["GET", "POST"])
@login_required
def new_org():
    require_super_admin()
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        slug = request.form.get("slug", "").strip().lower()
        if not name or not slug:
            flash("Name and slug are required.", "danger")
        elif Organization.query.filter_by(slug=slug).first():
            flash("Slug already taken.", "danger")
        else:
            org = Organization(name=name, slug=slug)
            db.session.add(org)
            db.session.commit()
            flash(f"Organization '{name}' created.", "success")
            return redirect(url_for("admin.index"))
    return render_template("admin/org_form.html", org=None)


@admin_bp.route("/orgs/<int:org_id>/users")
@login_required
def org_users(org_id):
    require_super_admin()
    org = Organization.query.get_or_404(org_id)
    users = User.query.filter_by(org_id=org_id).order_by(User.name).all()
    return render_template("admin/org_users.html", org=org, users=users)


@admin_bp.route("/orgs/<int:org_id>/users/new", methods=["GET", "POST"])
@login_required
def new_user(org_id):
    require_super_admin()
    org = Organization.query.get_or_404(org_id)
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        role = request.form.get("role", "member")
        if not name or not email or not password:
            flash("All fields are required.", "danger")
        elif User.query.filter_by(email=email).first():
            flash("Email already registered.", "danger")
        else:
            user = User(name=name, email=email, org_id=org_id, role=role)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            flash(f"User '{name}' created.", "success")
            return redirect(url_for("admin.org_users", org_id=org_id))
    return render_template("admin/user_form.html", org=org, user=None)
