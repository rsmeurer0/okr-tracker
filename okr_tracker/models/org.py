from datetime import datetime, timezone
from okr_tracker.extensions import db


class Organization(db.Model):
    __tablename__ = "organizations"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    slug = db.Column(db.String(64), unique=True, nullable=False)
    logo_url = db.Column(db.String(256))
    primary_color = db.Column(db.String(7), default="#0d6efd")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    users = db.relationship("User", back_populates="org", lazy="dynamic")
    objectives = db.relationship("Objective", back_populates="org", lazy="dynamic")

    def __repr__(self):
        return f"<Organization {self.slug}>"
