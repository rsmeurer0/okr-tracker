from datetime import datetime, timezone
from okr_tracker.extensions import db


class KeyResult(db.Model):
    __tablename__ = "key_results"

    id = db.Column(db.Integer, primary_key=True)
    objective_id = db.Column(db.Integer, db.ForeignKey("objectives.id"), nullable=False)
    title = db.Column(db.String(256), nullable=False)
    target_value = db.Column(db.Float, nullable=False)
    current_value = db.Column(db.Float, default=0.0)
    unit = db.Column(db.String(32))  # e.g. "%", "users", "revenue"
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    objective = db.relationship("Objective", back_populates="key_results")

    @property
    def progress(self):
        if not self.target_value:
            return 0
        return round(min((self.current_value / self.target_value) * 100, 100))

    def __repr__(self):
        return f"<KeyResult {self.title}>"
