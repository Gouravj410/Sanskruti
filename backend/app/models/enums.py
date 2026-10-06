import enum

class InformationLayer(str, enum.Enum):
    VERIFIED = "VERIFIED"               # Archival / Documented historical knowledge
    COMMUNITY = "COMMUNITY"             # Practitioner / Community contribution
    AI_INTERPRETATION = "AI_INTERPRETATION" # AI Explanation using archive context
    AI_GENERATED = "AI_GENERATED"       # Generative / Synthetic creative content

class PreservationStatus(str, enum.Enum):
    THRIVING = "THRIVING"
    LIVING = "LIVING"
    VULNERABLE = "VULNERABLE"
    ENDANGERED = "ENDANGERED"
    CRITICALLY_ENDANGERED = "CRITICALLY_ENDANGERED"

class VerificationStatus(str, enum.Enum):
    VERIFIED_BY_ARCHIVIST = "VERIFIED_BY_ARCHIVIST"
    COMMUNITY_VETTED = "COMMUNITY_VETTED"
    PENDING_REVIEW = "PENDING_REVIEW"
