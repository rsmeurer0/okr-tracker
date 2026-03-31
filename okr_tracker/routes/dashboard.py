from flask import Blueprint, render_template
from flask_login import login_required, current_user
from okr_tracker.models import Objective

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/")
@login_required
def index():
    if current_user.is_super_admin:
        objectives = Objective.query.order_by(Objective.created_at.desc()).all()
    else:
        objectives = (
            Objective.query
            .filter_by(org_id=current_user.org_id)
            .order_by(Objective.created_at.desc())
            .all()
        )
    return render_template("dashboard/index.html", objectives=objectives)
