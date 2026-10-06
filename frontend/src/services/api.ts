import {
  ArtFormSummary,
  ArtFormDetail,
  ArtifactSummary,
  ArtifactDetail,
  PractitionerEntry,
  AskSanskrutiResponse,
  ArchiveStats,
} from '../types';

const API_BASE = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `API request failed with status ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.detail) errorMsg = errData.detail;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Art forms
  getArtForms: async (params?: { region?: string; state?: string; status?: string; search?: string }): Promise<ArtFormSummary[]> => {
    const query = new URLSearchParams();
    if (params?.region) query.append('region', params.region);
    if (params?.state) query.append('state', params.state);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    return fetchJson<ArtFormSummary[]>(`${API_BASE}/art-forms?${query.toString()}`);
  },

  getArtFormBySlug: async (slug: string): Promise<ArtFormDetail> => {
    return fetchJson<ArtFormDetail>(`${API_BASE}/art-forms/${slug}`);
  },

  // Artifacts
  getArtifacts: async (params?: {
    art_form_id?: number;
    art_form_slug?: string;
    layer?: string;
    is_featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ArtifactSummary[]> => {
    const query = new URLSearchParams();
    if (params?.art_form_id) query.append('art_form_id', params.art_form_id.toString());
    if (params?.art_form_slug) query.append('art_form_slug', params.art_form_slug);
    if (params?.layer) query.append('layer', params.layer);
    if (params?.is_featured !== undefined) query.append('is_featured', String(params.is_featured));
    if (params?.search) query.append('search', params.search);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    return fetchJson<ArtifactSummary[]>(`${API_BASE}/artifacts?${query.toString()}`);
  },

  getArtifactById: async (id: number): Promise<ArtifactDetail> => {
    return fetchJson<ArtifactDetail>(`${API_BASE}/artifacts/${id}`);
  },

  // Practitioner & Community Entries
  getPractitioners: async (params?: { art_form_slug?: string }): Promise<PractitionerEntry[]> => {
    const query = new URLSearchParams();
    if (params?.art_form_slug) query.append('art_form_slug', params.art_form_slug);
    return fetchJson<PractitionerEntry[]>(`${API_BASE}/practitioners?${query.toString()}`);
  },

  submitPractitionerEntry: async (entry: {
    art_form_id: number;
    contributor_name: string;
    role_or_title: string;
    community_affiliation: string;
    location: string;
    title: string;
    content: string;
    lineage_tradition?: string;
    media_url?: string;
  }): Promise<PractitionerEntry> => {
    return fetchJson<PractitionerEntry>(`${API_BASE}/practitioners`, {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },

  // Multi-facet Search
  searchArchive: async (q: string): Promise<{
    query: string;
    counts: { art_forms: number; artifacts: number; motifs: number };
    art_forms: ArtFormSummary[];
    artifacts: ArtifactSummary[];
    motifs: Array<{ motif: any; art_form_slug: string; art_form_name: string }>;
  }> => {
    return fetchJson(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
  },

  // AI Cultural Intelligence
  askSanskruti: async (question: string, artFormSlug?: string): Promise<AskSanskrutiResponse> => {
    return fetchJson<AskSanskrutiResponse>(`${API_BASE}/ai/ask`, {
      method: 'POST',
      body: JSON.stringify({
        question,
        art_form_slug: artFormSlug || null,
      }),
    });
  },

  getSuggestedInquiries: async (): Promise<Array<{ art_form_slug: string; question: string; topic: string }>> => {
    return fetchJson(`${API_BASE}/ai/suggested-inquiries`);
  },

  // Stats
  getStats: async (): Promise<ArchiveStats> => {
    return fetchJson<ArchiveStats>(`${API_BASE}/stats`);
  },
};
