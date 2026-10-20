"""Create offers, assessments, and findings tables."""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial_database"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "offers",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("company_name", sa.String(length=200), nullable=False),
        sa.Column("job_title", sa.String(length=200), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("sender_email", sa.String(length=320), nullable=False),
        sa.Column("submitted_url", sa.String(length=2048)),
        sa.Column("company_website", sa.String(length=2048)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "assessments",
        sa.Column("id", sa.Integer(), autoincrement=True, primary_key=True),
        sa.Column("offer_id", sa.String(length=36), nullable=False, unique=True),
        sa.Column("category", sa.String(length=40), nullable=False),
        sa.Column("explanation", sa.Text(), nullable=False),
        sa.Column("checks", sa.JSON(), nullable=False),
        sa.Column("recommended_actions", sa.JSON(), nullable=False),
        sa.Column("limitations", sa.JSON(), nullable=False),
        sa.Column("domain_comparison", sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(["offer_id"], ["offers.id"], ondelete="CASCADE"),
    )
    op.create_table(
        "findings",
        sa.Column("id", sa.Integer(), autoincrement=True, primary_key=True),
        sa.Column("assessment_id", sa.Integer(), nullable=False),
        sa.Column("rule_id", sa.String(length=80), nullable=False),
        sa.Column("severity", sa.String(length=20), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("explanation", sa.Text(), nullable=False),
        sa.Column("evidence", sa.Text(), nullable=False),
        sa.Column("recommended_action", sa.Text()),
        sa.Column("source", sa.String(length=30), nullable=False),
        sa.ForeignKeyConstraint(["assessment_id"], ["assessments.id"], ondelete="CASCADE"),
    )


def downgrade() -> None:
    op.drop_table("findings")
    op.drop_table("assessments")
    op.drop_table("offers")
