"""Store explainable risk scoring results."""

from alembic import op
import sqlalchemy as sa

revision = "0004_risk_scoring"
down_revision = "0003_ml_assessment"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("assessments", sa.Column("risk_score", sa.Integer(), nullable=True))
    op.add_column("assessments", sa.Column("risk_level", sa.String(length=20), nullable=True))
    op.add_column("assessments", sa.Column("score_breakdown", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("assessments", "score_breakdown")
    op.drop_column("assessments", "risk_level")
    op.drop_column("assessments", "risk_score")
