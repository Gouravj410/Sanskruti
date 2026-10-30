"""initial_archival_schema

Revision ID: 96f84f064bd8
Revises: 
Create Date: 2026-10-28 01:04:35.998654

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

# revision identifiers, used by Alembic.
revision: str = '96f84f064bd8'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    existing_tables = inspector.get_table_names()

    # 1. art_forms table
    if 'art_forms' not in existing_tables:
        op.create_table(
            'art_forms',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('slug', sa.String(length=100), nullable=False),
            sa.Column('name', sa.String(length=150), nullable=False),
            sa.Column('native_name', sa.String(length=150), nullable=True),
            sa.Column('category', sa.String(length=100), nullable=False, server_default='Traditional Visual Art'),
            sa.Column('region', sa.String(length=150), nullable=False),
            sa.Column('states', sa.JSON(), nullable=False),
            sa.Column('period_origin', sa.String(length=150), nullable=False),
            sa.Column('summary', sa.Text(), nullable=False),
            sa.Column('historical_context', sa.Text(), nullable=False),
            sa.Column('ritual_context', sa.Text(), nullable=False),
            sa.Column('preservation_status', sa.String(length=50), nullable=False),
            sa.Column('canonical_motifs', sa.JSON(), nullable=False),
            sa.Column('traditional_materials', sa.JSON(), nullable=False),
            sa.Column('techniques', sa.JSON(), nullable=False),
            sa.Column('practitioner_communities', sa.JSON(), nullable=False),
            sa.Column('sources', sa.JSON(), nullable=False),
            sa.Column('cover_image_url', sa.String(length=500), nullable=False),
            sa.Column('banner_image_url', sa.String(length=500), nullable=True),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
        )
        op.create_index(op.f('ix_art_forms_id'), 'art_forms', ['id'], unique=False)
        op.create_index(op.f('ix_art_forms_slug'), 'art_forms', ['slug'], unique=True)

    # 2. artifacts table
    if 'artifacts' not in existing_tables:
        op.create_table(
            'artifacts',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('art_form_id', sa.Integer(), sa.ForeignKey('art_forms.id', ondelete='CASCADE'), nullable=False),
            sa.Column('accession_number', sa.String(length=50), nullable=False),
            sa.Column('title', sa.String(length=200), nullable=False),
            sa.Column('native_title', sa.String(length=200), nullable=True),
            sa.Column('information_layer', sa.String(length=50), nullable=False, server_default='VERIFIED'),
            sa.Column('period_estimated', sa.String(length=100), nullable=False),
            sa.Column('artist_attribution', sa.String(length=150), nullable=False),
            sa.Column('region_origin', sa.String(length=150), nullable=False),
            sa.Column('medium', sa.String(length=150), nullable=False),
            sa.Column('dimensions', sa.String(length=100), nullable=True),
            sa.Column('materials_used', sa.JSON(), nullable=False),
            sa.Column('description', sa.Text(), nullable=False),
            sa.Column('iconography_analysis', sa.Text(), nullable=True),
            sa.Column('provenance', sa.Text(), nullable=True),
            sa.Column('verification_source', sa.String(length=300), nullable=False),
            sa.Column('image_url', sa.String(length=500), nullable=False),
            sa.Column('thumbnail_url', sa.String(length=500), nullable=True),
            sa.Column('tags', sa.JSON(), nullable=False),
            sa.Column('is_featured', sa.Boolean(), server_default=sa.false(), nullable=False),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
        )
        op.create_index(op.f('ix_artifacts_id'), 'artifacts', ['id'], unique=False)
        op.create_index(op.f('ix_artifacts_accession_number'), 'artifacts', ['accession_number'], unique=True)
        op.create_index(op.f('ix_artifacts_art_form_id'), 'artifacts', ['art_form_id'], unique=False)
        op.create_index(op.f('ix_artifacts_information_layer'), 'artifacts', ['information_layer'], unique=False)
        op.create_index(op.f('ix_artifacts_is_featured'), 'artifacts', ['is_featured'], unique=False)

    # 3. practitioner_entries table
    if 'practitioner_entries' not in existing_tables:
        op.create_table(
            'practitioner_entries',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('art_form_id', sa.Integer(), sa.ForeignKey('art_forms.id', ondelete='CASCADE'), nullable=False),
            sa.Column('contributor_name', sa.String(length=150), nullable=False),
            sa.Column('role_or_title', sa.String(length=100), nullable=False),
            sa.Column('community_affiliation', sa.String(length=150), nullable=False),
            sa.Column('location', sa.String(length=150), nullable=False),
            sa.Column('title', sa.String(length=200), nullable=False),
            sa.Column('content', sa.Text(), nullable=False),
            sa.Column('lineage_tradition', sa.String(length=200), nullable=True),
            sa.Column('media_url', sa.String(length=500), nullable=True),
            sa.Column('information_layer', sa.String(length=50), nullable=False, server_default='COMMUNITY'),
            sa.Column('verification_status', sa.String(length=50), nullable=False, server_default='PENDING_REVIEW'),
            sa.Column('curator_notes', sa.Text(), nullable=True),
            sa.Column('reviewed_at', sa.DateTime(), nullable=True),
            sa.Column('reviewed_by', sa.String(length=100), nullable=True),
            sa.Column('published_at', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        )
        op.create_index(op.f('ix_practitioner_entries_id'), 'practitioner_entries', ['id'], unique=False)
        op.create_index(op.f('ix_practitioner_entries_art_form_id'), 'practitioner_entries', ['art_form_id'], unique=False)
        op.create_index(op.f('ix_practitioner_entries_verification_status'), 'practitioner_entries', ['verification_status'], unique=False)
    else:
        # Table exists: add new columns and index if missing
        existing_cols = [c['name'] for c in inspector.get_columns('practitioner_entries')]
        if 'curator_notes' not in existing_cols:
            op.add_column('practitioner_entries', sa.Column('curator_notes', sa.Text(), nullable=True))
        if 'reviewed_at' not in existing_cols:
            op.add_column('practitioner_entries', sa.Column('reviewed_at', sa.DateTime(), nullable=True))
        if 'reviewed_by' not in existing_cols:
            op.add_column('practitioner_entries', sa.Column('reviewed_by', sa.String(length=100), nullable=True))
        if 'published_at' not in existing_cols:
            op.add_column('practitioner_entries', sa.Column('published_at', sa.DateTime(), nullable=True))
        
        existing_indexes = [idx['name'] for idx in inspector.get_indexes('practitioner_entries')]
        if 'ix_practitioner_entries_verification_status' not in existing_indexes:
            try:
                op.create_index(op.f('ix_practitioner_entries_verification_status'), 'practitioner_entries', ['verification_status'], unique=False)
            except Exception:
                pass

    # 4. ai_query_logs table
    if 'ai_query_logs' not in existing_tables:
        op.create_table(
            'ai_query_logs',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('art_form_id', sa.Integer(), sa.ForeignKey('art_forms.id', ondelete='SET NULL'), nullable=True),
            sa.Column('question', sa.Text(), nullable=False),
            sa.Column('answer', sa.Text(), nullable=False),
            sa.Column('retrieved_art_form_slugs', sa.JSON(), nullable=False),
            sa.Column('retrieved_artifact_ids', sa.JSON(), nullable=False),
            sa.Column('cited_sources', sa.JSON(), nullable=False),
            sa.Column('information_layer', sa.String(length=50), nullable=False, server_default='AI_INTERPRETATION'),
            sa.Column('model_name', sa.String(length=100), nullable=False),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        )
        op.create_index(op.f('ix_ai_query_logs_id'), 'ai_query_logs', ['id'], unique=False)


def downgrade() -> None:
    op.drop_table('ai_query_logs')
    op.drop_table('practitioner_entries')
    op.drop_table('artifacts')
    op.drop_table('art_forms')
