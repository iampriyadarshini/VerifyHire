"""Store the optional experimental ML assessment."""

from alembic import op
import sqlalchemy as sa

revision = "0003_ml_assessment"
down_revision = "0002_evidence_records"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("assessments", sa.Column("ml_assessment", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("assessments", "ml_assessment")
