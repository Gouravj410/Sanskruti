export type InformationLayer = 'VERIFIED' | 'COMMUNITY' | 'AI_INTERPRETATION' | 'AI_GENERATED';

export type PreservationStatus = 'THRIVING' | 'LIVING' | 'VULNERABLE' | 'ENDANGERED' | 'CRITICALLY_ENDANGERED';

export type VerificationStatus = 'VERIFIED_BY_ARCHIVIST' | 'COMMUNITY_VETTED' | 'PENDING_REVIEW';

export interface CanonicalMotif {
  name: string;
  symbolism: string;
  visual_cue: string;
  cultural_meaning?: string;
}

export interface TraditionalMaterial {
  name: string;
  category: string;
  natural_source: string;
  preparation?: string;
  purpose?: string;
}

export interface TechniqueStep {
  step_order: number;
  name: string;
  description: string;
  tool?: string;
}

export interface ArchivalSource {
  title: string;
  author?: string;
  year?: string;
  archive_institution?: string;
  citation_type?: string;
  isbn_or_url?: string;
}

export interface ArtFormSummary {
  id: number;
  slug: string;
  name: string;
  native_name?: string;
  category: string;
  region: string;
  states: string[];
  period_origin: string;
  summary: string;
  preservation_status: PreservationStatus;
  cover_image_url: string;
  banner_image_url?: string;
  artifact_count?: number;
}

export interface ArtFormDetail extends ArtFormSummary {
  historical_context: string;
  ritual_context: string;
  canonical_motifs: CanonicalMotif[];
  traditional_materials: TraditionalMaterial[];
  techniques: TechniqueStep[];
  practitioner_communities: string[];
  sources: ArchivalSource[];
  banner_image_url?: string;
  created_at: string;
  updated_at: string;
  practitioner_count: number;
}

export interface ArtifactSummary {
  id: number;
  art_form_id: number;
  art_form_name?: string;
  art_form_slug?: string;
  accession_number: string;
  title: string;
  native_title?: string;
  information_layer: InformationLayer;
  period_estimated: string;
  artist_attribution: string;
  region_origin: string;
  medium: string;
  image_url: string;
  thumbnail_url?: string;
  is_featured: boolean;
  tags: string[];
}

export interface ArtifactDetail extends ArtifactSummary {
  dimensions?: string;
  materials_used: string[];
  description: string;
  iconography_analysis?: string;
  provenance?: string;
  verification_source: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PractitionerEntry {
  id: number;
  art_form_id: number;
  art_form_name?: string;
  art_form_slug?: string;
  contributor_name: string;
  role_or_title: string;
  community_affiliation: string;
  location: string;
  title: string;
  content: string;
  lineage_tradition?: string;
  media_url?: string;
  information_layer: InformationLayer;
  verification_status: VerificationStatus;
  created_at: string;
}

export interface SourceCitation {
  title: string;
  author?: string;
  year?: string;
  archive_institution?: string;
  citation_type?: string;
  layer: string;
}

export interface GroundedArtifactRef {
  id: number;
  accession_number: string;
  title: string;
  art_form_name: string;
  information_layer: InformationLayer;
  image_url: string;
}

export interface AskSanskrutiResponse {
  question: string;
  answer: string;
  information_layer: InformationLayer;
  model_used: string;
  is_grounded: boolean;
  context_art_form?: string;
  sources_cited: SourceCitation[];
  grounded_artifacts: GroundedArtifactRef[];
  disclaimer: string;
}

export interface ArchiveStats {
  total_art_forms: number;
  total_artifacts: number;
  total_motifs: number;
  total_practitioners: number;
  represented_states: number;
  layers: {
    verified_count: number;
    community_count: number;
    ai_interpretation_count: number;
    ai_generated_count: number;
  };
  categories: Record<string, number>;
}
