from datetime import datetime, timezone
from okr_tracker.extensions import db


class Objective(db.Model):
    __tablename__ = "objectives"

    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(256), nullable=False)
    description = db.Column(db.Text)
    time_period = db.Column(db.String(32))  # e.g. "Q1 2026"
    status = db.Column(db.String(32), default="draft")  # draft, active, completed
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    org = db.relationship("Organization", back_populates="objectives")
    owner = db.relationship("User", back_populates="objectives")
    key_results = db.relationship("KeyResult", back_populates="objective", lazy="dynamic", cascade="all, delete-orphan")

    @property
    def progress(self):
        krs = self.key_results.all()
        if not krs:
            return 0
        total = sum(
            min((kr.current_value / kr.target_value) * 100, 100)
            for kr in krs
            if kr.target_value
        )
        return round(total / len(krs))

    def __repr__(self):
        return f"<Objective {self.title}>"
