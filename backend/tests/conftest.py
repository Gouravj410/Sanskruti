import os
import sys
import io
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
# Configure safe test settings
settings.ENVIRONMENT = "testing"
settings.CURATOR_API_KEY = "test_curator_secret_key"
settings.GEMINI_API_KEY = ""  # No paid calls in tests

from app.main import app
from app.database.session import Base, get_db
from app.models.art_form import ArtForm
from app.models.artifact import Artifact
from app.models.practitioner import PractitionerEntry
from app.models.enums import InformationLayer, PreservationStatus, VerificationStatus

# Isolated in-memory SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    # Seed minimal baseline test records
    test_art_form = ArtForm(
        id=1,
        slug="warli",
        name="Warli Tribal Wall Art",
        native_name="वारली चित्रकला",
        category="Indigenous Ritual Wall Painting",
        region="Western Ghats (Maharashtra)",
        states=["Maharashtra", "Gujarat"],
        period_origin="10th Century CE or earlier",
        summary="Monochromatic ritual sacred paintings using rice paste on cow dung wash.",
        historical_context="Documented in anthropological surveys across Thane district.",
        ritual_context="Lagna Chowk painted during wedding ceremonies to invoke Goddess Palaghat.",
        preservation_status=PreservationStatus.LIVING.value,
        canonical_motifs=[
            {
                "name": "Tarpa Dance Circle",
                "symbolism": "Cosmic spiral of life and unity",
                "visual_cue": "Concentric circle of interlocking dancers around a central musician"
            }
        ],
        traditional_materials=[
            {
                "name": "Rice Flour Paste",
                "category": "Organic Binder / White Pigment",
                "natural_source": "Milled rice blended with water and acacia gum binder"
            }
        ],
        sources=[
            {
                "title": "The Painted World of the Warlis",
                "author": "Yashodhara Dalmia",
                "year": "1988",
                "archive_institution": "Lalit Kala Akademi"
            }
        ],
        cover_image_url="images/art-forms/warli.jpg"
    )
    session.add(test_art_form)
    session.commit()

    test_artifact = Artifact(
        id=1,
        art_form_id=1,
        accession_number="SVR-WAR-001",
        title="Ceremonial Tarpa Dance at Harvest Consecration",
        native_title="तारपा नृत्य",
        information_layer=InformationLayer.VERIFIED.value,
        period_estimated="Circa 1970",
        artist_attribution="Jivya Soma Mashe Lineage",
        region_origin="Dahanu, Palghar District, Maharashtra",
        medium="Rice paste and natural water-soluble gum on mud-treated canvas",
        description="Masterwork depicting the nocturnal circular Tarpa celebration.",
        provenance="Acquired from National Crafts Museum documentation register.",
        verification_source="National Handicrafts and Handlooms Museum, New Delhi",
        image_url="images/art-forms/warli.jpg",
        is_featured=True,
        tags=["harvest", "ritual", "spiral", "tarpa"]
    )
    session.add(test_artifact)
    session.commit()

    test_practitioner = PractitionerEntry(
        id=1,
        art_form_id=1,
        contributor_name="Kiran Mashe",
        role_or_title="Hereditary Warli Artisan",
        community_affiliation="Warli Adivasi Clan",
        location="Ganjad, Maharashtra",
        title="Consecration of the Tarpa Instrument",
        content="Before playing the bamboo tarpa, the musician offers unbroken rice grains.",
        lineage_tradition="Direct disciple of Padma Shri Jivya Soma Mashe",
        information_layer=InformationLayer.COMMUNITY.value,
        verification_status=VerificationStatus.PUBLISHED.value
    )
    session.add(test_practitioner)
    session.commit()

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def curator_headers():
    return {"X-Curator-Key": "test_curator_secret_key"}
