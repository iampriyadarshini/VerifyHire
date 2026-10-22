"""Store minimum structured screenshot and email analysis results."""

from alembic import op
import sqlalchemy as sa

revision = "0002_evidence_records"
down_revision = "0001_initial_database"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "evidence_records",
        sa.Column("id", sa.Integer(), autoincrement=True, primary_key=True),
        sa.Column("offer_id", sa.String(length=36), nullable=True),
        sa.Column("evidence_type", sa.String(length=30), nullable=False),
        sa.Column("result", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["offer_id"], ["offers.id"], ondelete="CASCADE"),
    )


def downgrade() -> None:
    op.drop_table("evidence_records")
