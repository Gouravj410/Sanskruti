import type {
  ArtFormSummary,
  ArtFormDetail,
  ArtifactSummary,
  ArtifactDetail,
  PractitionerEntry,
  AskSanskrutiResponse,
  ArchiveStats,
  CanonicalMotifItem,
} from '../types/index.ts';
import { MOCK_ARCHIVE_DATA } from '../data/mockArchiveData.ts';

const meta = import.meta as any;
export const API_BASE: string = meta.env?.VITE_API_URL || '/api/v1';
export const IS_DEMO_MODE: boolean = meta.env?.VITE_DEMO_MODE === 'true';

export function formatMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base: string = (import.meta as any).env?.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  return `${cleanBase}${cleanUrl}`;
}

function formatArtForm<T extends ArtFormSummary | ArtFormDetail>(af: T): T {
  return {
    ...af,
    cover_image_url: formatMediaUrl(af.cover_image_url),
    ...(af.banner_image_url ? { banner_image_url: formatMediaUrl(af.banner_image_url) } : {}),
  };
}

function formatArtifact<T extends ArtifactSummary | ArtifactDetail>(art: T): T {
  return {
    ...art,
    image_url: formatMediaUrl(art.image_url),
    ...(art.thumbnail_url ? { thumbnail_url: formatMediaUrl(art.thumbnail_url) } : {}),
  };
}

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
        const errData = (await res.json()) as any;
        if (errData?.detail) errorMsg = errData.detail;
      } catch {
        // Keep default error message
      }
      throw new Error(errorMsg);
    }

    return (await res.json()) as T;
}

/**
 * Legacy Gemini client stub - client-side key storage is deprecated in favor of server-side security.
 * Kept for non-breaking interface compatibility during transition.
 */
export const geminiAuth = {
  getKey: (): string => '',
  setKey: (_key: string) => {},
  clearKey: () => {},
  isConnected: (): boolean => false,
  testConnection: async (_key: string): Promise<boolean> => false,
};

export const api = {
  // Art forms
  getArtForms: async (params?: {
    region?: string;
    state?: string;
    status?: string;
    search?: string;
  }): Promise<ArtFormSummary[]> => {
    try {
      const query = new URLSearchParams();
      if (params?.region) query.append('region', params.region);
      if (params?.state) query.append('state', params.state);
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);
      const res = await fetchJson<ArtFormSummary[]>(`${API_BASE}/art-forms?${query.toString()}`);
      return res.map(formatArtForm);
    } catch (err) {
      if (IS_DEMO_MODE) {
        console.warn('[Sanskruti Demo Mode] Backend unavailable, serving art forms from demo fixtures:', err);
        let list = [...MOCK_ARCHIVE_DATA.art_forms] as unknown as ArtFormDetail[];
        if (params?.region) {
          list = list.filter((af) => af.region.toLowerCase().includes(params.region!.toLowerCase()));
        }
        if (params?.state) {
          list = list.filter((af) => af.states.some((s) => s.toLowerCase().includes(params.state!.toLowerCase())));
        }
        if (params?.status) {
          list = list.filter((af) => af.preservation_status === params.status);
        }
        if (params?.search) {
          const q = params.search.toLowerCase();
          list = list.filter(
            (af) =>
              af.name.toLowerCase().includes(q) ||
              af.summary.toLowerCase().includes(q) ||
              af.region.toLowerCase().includes(q) ||
              (af.native_name && af.native_name.toLowerCase().includes(q))
          );
        }
        return (list as unknown as ArtFormSummary[]).map(formatArtForm);
      }
      throw err;
    }
  },

  getArtFormBySlug: async (slug: string): Promise<ArtFormDetail> => {
    try {
      const res = await fetchJson<ArtFormDetail>(`${API_BASE}/art-forms/${slug}`);
      return formatArtForm(res);
    } catch (err) {
      if (IS_DEMO_MODE) {
        console.warn(`[Sanskruti Demo Mode] Backend unavailable, serving art form "${slug}" from demo fixtures:`, err);
        const found = MOCK_ARCHIVE_DATA.art_forms.find((af) => af.slug === slug);
        if (!found) throw new Error(`Art form "${slug}" not found in archive.`);
        return formatArtForm(found as unknown as ArtFormDetail);
      }
      throw err;
    }
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
    try {
      const query = new URLSearchParams();
      if (params?.art_form_id) query.append('art_form_id', params.art_form_id.toString());
      if (params?.art_form_slug) query.append('art_form_slug', params.art_form_slug);
      if (params?.layer) query.append('layer', params.layer);
      if (params?.is_featured !== undefined) query.append('is_featured', String(params.is_featured));
      if (params?.search) query.append('search', params.search);
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.offset) query.append('offset', params.offset.toString());
      const res = await fetchJson<ArtifactSummary[]>(`${API_BASE}/artifacts?${query.toString()}`);
      return res.map(formatArtifact);
    } catch (err) {
      if (IS_DEMO_MODE) {
        console.warn('[Sanskruti Demo Mode] Backend unavailable, serving artifacts from demo fixtures:', err);
        let list = [...MOCK_ARCHIVE_DATA.artifacts] as unknown as ArtifactDetail[];
        if (params?.art_form_id) {
          list = list.filter((a) => a.art_form_id === params.art_form_id);
        }
        if (params?.art_form_slug) {
          list = list.filter((a) => a.art_form_slug === params.art_form_slug);
        }
        if (params?.layer) {
          list = list.filter((a) => a.information_layer === params.layer);
        }
        if (params?.is_featured !== undefined) {
          list = list.filter((a) => a.is_featured === params.is_featured);
        }
        if (params?.search) {
          const q = params.search.toLowerCase();
          list = list.filter(
            (a) =>
              a.title.toLowerCase().includes(q) ||
              a.description.toLowerCase().includes(q) ||
              a.medium.toLowerCase().includes(q) ||
              a.artist_attribution.toLowerCase().includes(q) ||
              a.accession_number.toLowerCase().includes(q)
          );
        }
        const offset = params?.offset || 0;
        const limit = params?.limit ? offset + params.limit : undefined;
        return (list.slice(offset, limit) as unknown as ArtifactSummary[]).map(formatArtifact);
      }
      throw err;
    }
  },

  getArtifactById: async (id: number): Promise<ArtifactDetail> => {
    try {
      const res = await fetchJson<ArtifactDetail>(`${API_BASE}/artifacts/${id}`);
      return formatArtifact(res);
    } catch (err) {
      if (IS_DEMO_MODE) {
        console.warn(`[Sanskruti Demo Mode] Backend unavailable, serving artifact ${id} from demo fixtures:`, err);
        const found = MOCK_ARCHIVE_DATA.artifacts.find((a) => a.id === id);
        if (!found) throw new Error(`Artifact ID ${id} not found.`);
        return formatArtifact(found as unknown as ArtifactDetail);
      }
      throw err;
    }
  },

  // Practitioner & Community Entries (Public view: Approved/Published only)
  getPractitioners: async (params?: { art_form_slug?: string }): Promise<PractitionerEntry[]> => {
    try {
      const query = new URLSearchParams();
      if (params?.art_form_slug) query.append('art_form_slug', params.art_form_slug);
      return await fetchJson<PractitionerEntry[]>(`${API_BASE}/practitioners?${query.toString()}`);
    } catch (err) {
      if (IS_DEMO_MODE) {
        console.warn('[Sanskruti Demo Mode] Backend unavailable, serving practitioners from demo fixtures:', err);
        const combined = [...MOCK_ARCHIVE_DATA.practitioners] as unknown as PractitionerEntry[];
        if (params?.art_form_slug) {
          return combined.filter((p) => p.art_form_slug === params.art_form_slug);
        }
        return combined;
      }
      throw err;
    }
  },

  // Public Submission Flow: defaults to PENDING_REVIEW; cannot self-publish
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
    return await fetchJson<PractitionerEntry>(`${API_BASE}/practitioners`, {
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
    try {
      const res = await fetchJson<any>(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
      return {
        ...res,
        art_forms: (res.art_forms || []).map(formatArtForm),
        artifacts: (res.artifacts || []).map(formatArtifact),
      };
    } catch (err) {
      if (IS_DEMO_MODE) {
        console.warn(`[Sanskruti Demo Mode] Backend search unavailable, searching demo fixtures for "${q}":`, err);
        const lower = q.toLowerCase();
        const matchedArtForms = (MOCK_ARCHIVE_DATA.art_forms as unknown as ArtFormDetail[]).filter(
          (af) =>
            af.name.toLowerCase().includes(lower) ||
            af.summary.toLowerCase().includes(lower) ||
            af.region.toLowerCase().includes(lower) ||
            (af.native_name && af.native_name.toLowerCase().includes(lower))
        );

        const matchedArtifacts = (MOCK_ARCHIVE_DATA.artifacts as unknown as ArtifactDetail[]).filter(
          (a) =>
            a.title.toLowerCase().includes(lower) ||
            a.description.toLowerCase().includes(lower) ||
            a.medium.toLowerCase().includes(lower) ||
            a.artist_attribution.toLowerCase().includes(lower)
        );

        const matchedMotifs: Array<{ motif: any; art_form_slug: string; art_form_name: string }> = [];
        (MOCK_ARCHIVE_DATA.art_forms as unknown as any[]).forEach((af) => {
          ((af.canonical_motifs || []) as any[]).forEach((m) => {
            if (
              m.name.toLowerCase().includes(lower) ||
              m.symbolism.toLowerCase().includes(lower) ||
              m.visual_cue.toLowerCase().includes(lower)
            ) {
              matchedMotifs.push({
                motif: m,
                art_form_slug: af.slug,
                art_form_name: af.name,
              });
            }
          });
        });

        return {
          query: q,
          counts: {
            art_forms: matchedArtForms.length,
            artifacts: matchedArtifacts.length,
            motifs: matchedMotifs.length,
          },
          art_forms: (matchedArtForms as unknown as ArtFormSummary[]).map(formatArtForm),
          artifacts: (matchedArtifacts as unknown as ArtifactSummary[]).map(formatArtifact),
          motifs: matchedMotifs,
        };
      }
      throw err;
    }
  },

  // Canonical Motifs endpoint
  getCanonicalMotifs: async (params?: {
    search?: string;
    art_form_slug?: string;
  }): Promise<CanonicalMotifItem[]> => {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.art_form_slug) query.append('art_form_slug', params.art_form_slug);
      return await fetchJson<CanonicalMotifItem[]>(`${API_BASE}/search/motifs?${query.toString()}`);
    } catch (err) {
      if (IS_DEMO_MODE) {
        console.warn('[Sanskruti Demo Mode] Backend unavailable, extracting canonical motifs from demo fixtures:', err);
        const results: CanonicalMotifItem[] = [];
        const lowerSearch = (params?.search || '').toLowerCase();
        (MOCK_ARCHIVE_DATA.art_forms as unknown as any[]).forEach((af) => {
          if (params?.art_form_slug && af.slug !== params.art_form_slug) return;
          ((af.canonical_motifs || []) as any[]).forEach((m, idx) => {
            if (
              !lowerSearch ||
              m.name.toLowerCase().includes(lowerSearch) ||
              m.symbolism.toLowerCase().includes(lowerSearch) ||
              m.visual_cue.toLowerCase().includes(lowerSearch)
            ) {
              results.push({
                id: `${af.slug}-${idx}`,
                name: m.name,
                symbolism: m.symbolism,
                visual_cue: m.visual_cue,
                cultural_meaning: m.cultural_meaning || m.symbolism,
                art_form_name: af.name,
                art_form_slug: af.slug,
                region: af.region,
                sources: af.sources as any,
              });
            }
          });
        });
        return results;
      }
      throw err;
    }
  },

  // AI Cultural Intelligence - Strictly routed via backend proxy; credentials never stored in browser
  askSanskruti: async (
    question: string,
    artFormSlug?: string,
    geminiApiKey?: string
  ): Promise<AskSanskrutiResponse> => {
    const res = await fetchJson<AskSanskrutiResponse>(`${API_BASE}/ai/ask`, {
      method: 'POST',
      body: JSON.stringify({
        question,
        art_form_slug: artFormSlug || null,
        gemini_api_key: geminiApiKey ? geminiApiKey.trim() : null,
      }),
    });
    return {
      ...res,
      grounded_artifacts: (res.grounded_artifacts || []).map((a) => ({
        ...a,
        image_url: formatMediaUrl(a.image_url),
      })),
    };
  },

  getSuggestedInquiries: async (): Promise<Array<{ art_form_slug: string; question: string; topic: string }>> => {
    try {
      return await fetchJson(`${API_BASE}/ai/suggested-inquiries`);
    } catch (err) {
      if (IS_DEMO_MODE) {
        return [
          {
            art_form_slug: 'madhubani',
            question: 'What is the symbolic meaning of the Kohbar motif in Madhubani bridal chambers?',
            topic: 'Sacred Iconography',
          },
          {
            art_form_slug: 'kolam',
            question: 'How does the mathematical symmetry of Brahma Mudi Kolam connect to spiritual discipline?',
            topic: 'Sacred Geometry',
          },
          {
            art_form_slug: 'warli',
            question: 'Why is the Tarpa dance depicted in concentric spirals rather than linear rows in Warli?',
            topic: 'Cosmic Symbolism',
          },
          {
            art_form_slug: 'kalamkari',
            question: 'What are the 23 traditional steps and organic mordants required in authentic Srikalahasti Kalamkari?',
            topic: 'Natural Metallurgy & Pigments',
          },
          {
            art_form_slug: 'phad',
            question: 'How do Bhopa-Bhopi priest-singers awaken and consecrate a Phad scroll before nocturnal performance?',
            topic: 'Ritual & Performance Tradition',
          },
          {
            art_form_slug: 'gond',
            question: "What is the belief behind the signature 'Dharma' patterned strokes created by Pardhan Gond artisans?",
            topic: 'Animism & Nature Spirits',
          },
        ];
      }
      throw err;
    }
  },

  // Stats
  getStats: async (): Promise<ArchiveStats> => {
    return await fetchJson<ArchiveStats>(`${API_BASE}/stats`);
  },

  // Curator Operations (Authorized via X-Curator-Key)
  verifyCuratorKey: async (curatorKey: string): Promise<boolean> => {
    try {
      const res = await fetchJson<{ valid: boolean }>(`${API_BASE}/curator/verify-key`, {
        method: 'POST',
        headers: { 'X-Curator-Key': curatorKey },
      });
      return !!res.valid;
    } catch {
      return false;
    }
  },

  getCuratorSubmissions: async (
    curatorKey: string,
    status?: string
  ): Promise<PractitionerEntry[]> => {
    const query = new URLSearchParams();
    if (status && status !== 'ALL') query.append('status', status);
    return await fetchJson<PractitionerEntry[]>(`${API_BASE}/curator/submissions?${query.toString()}`, {
      headers: { 'X-Curator-Key': curatorKey },
    });
  },

  reviewSubmission: async (
    curatorKey: string,
    entryId: number,
    data: {
      status: string;
      curator_notes?: string;
      reviewed_by?: string;
    }
  ): Promise<PractitionerEntry> => {
    return await fetchJson<PractitionerEntry>(`${API_BASE}/curator/submissions/${entryId}/review`, {
      method: 'POST',
      headers: { 'X-Curator-Key': curatorKey },
      body: JSON.stringify(data),
    });
  },

  uploadMedia: async (
    curatorKey: string,
    file: File,
    folder: string = 'general'
  ): Promise<{ filename: string; path: string; url: string; size_bytes: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      headers: {
        'X-Curator-Key': curatorKey,
      },
      body: formData,
    });

    if (!res.ok) {
      let errorMsg = `Upload failed with status ${res.status}`;
      try {
        const errData = (await res.json()) as any;
        if (errData?.detail) errorMsg = errData.detail;
      } catch {}
      throw new Error(errorMsg);
    }

    return (await res.json()) as { filename: string; path: string; url: string; size_bytes: number };
  },
};
