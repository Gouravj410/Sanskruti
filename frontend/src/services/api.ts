import {
  ArtFormSummary,
  ArtFormDetail,
  ArtifactSummary,
  ArtifactDetail,
  PractitionerEntry,
  AskSanskrutiResponse,
  ArchiveStats,
} from '../types';
import { MOCK_ARCHIVE_DATA } from '../data/mockArchiveData';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export function formatMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = import.meta.env.BASE_URL || '/';
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
      const errData = await res.json();
      if (errData.detail) errorMsg = errData.detail;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

// Helpers for localStorage persistence in static/GitHub Pages mode
const LOCAL_STORAGE_PRACTITIONERS_KEY = 'sanskruti_local_practitioners';
const GEMINI_STORAGE_KEY = 'sanskruti_gemini_api_key';

export const geminiAuth = {
  getKey: (): string => {
    return localStorage.getItem(GEMINI_STORAGE_KEY) || import.meta.env.VITE_GEMINI_API_KEY || '';
  },
  setKey: (key: string) => {
    if (key.trim()) {
      localStorage.setItem(GEMINI_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(GEMINI_STORAGE_KEY);
    }
  },
  clearKey: () => {
    localStorage.removeItem(GEMINI_STORAGE_KEY);
  },
  isConnected: (): boolean => {
    return !!(localStorage.getItem(GEMINI_STORAGE_KEY) || import.meta.env.VITE_GEMINI_API_KEY);
  },
  testConnection: async (key: string): Promise<boolean> => {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key.trim()}`;
      const payload = {
        contents: [{ role: 'user', parts: [{ text: 'Respond with: OK' }] }],
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};

function getLocalPractitioners(): PractitionerEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRACTITIONERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read practitioners from localStorage:', e);
  }
  return [];
}

function saveLocalPractitioner(entry: PractitionerEntry) {
  try {
    const existing = getLocalPractitioners();
    existing.unshift(entry);
    localStorage.setItem(LOCAL_STORAGE_PRACTITIONERS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.warn('Could not save practitioner to localStorage:', e);
  }
}

export const api = {
  // Art forms
  getArtForms: async (params?: { region?: string; state?: string; status?: string; search?: string }): Promise<ArtFormSummary[]> => {
    try {
      const query = new URLSearchParams();
      if (params?.region) query.append('region', params.region);
      if (params?.state) query.append('state', params.state);
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);
      const res = await fetchJson<ArtFormSummary[]>(`${API_BASE}/art-forms?${query.toString()}`);
      return res.map(formatArtForm);
    } catch {
      // Fallback to static archive data
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
  },

  getArtFormBySlug: async (slug: string): Promise<ArtFormDetail> => {
    try {
      const res = await fetchJson<ArtFormDetail>(`${API_BASE}/art-forms/${slug}`);
      return formatArtForm(res);
    } catch {
      const found = MOCK_ARCHIVE_DATA.art_forms.find((af) => af.slug === slug);
      if (!found) throw new Error(`Art form "${slug}" not found in archive.`);
      return formatArtForm(found as unknown as ArtFormDetail);
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
    } catch {
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
  },

  getArtifactById: async (id: number): Promise<ArtifactDetail> => {
    try {
      const res = await fetchJson<ArtifactDetail>(`${API_BASE}/artifacts/${id}`);
      return formatArtifact(res);
    } catch {
      const found = MOCK_ARCHIVE_DATA.artifacts.find((a) => a.id === id);
      if (!found) throw new Error(`Artifact ID ${id} not found.`);
      return formatArtifact(found as unknown as ArtifactDetail);
    }
  },

  // Practitioner & Community Entries
  getPractitioners: async (params?: { art_form_slug?: string }): Promise<PractitionerEntry[]> => {
    try {
      const query = new URLSearchParams();
      if (params?.art_form_slug) query.append('art_form_slug', params.art_form_slug);
      return await fetchJson<PractitionerEntry[]>(`${API_BASE}/practitioners?${query.toString()}`);
    } catch {
      const local = getLocalPractitioners();
      const combined = [...local, ...MOCK_ARCHIVE_DATA.practitioners] as unknown as PractitionerEntry[];
      if (params?.art_form_slug) {
        return combined.filter((p) => p.art_form_slug === params.art_form_slug);
      }
      return combined;
    }
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
    try {
      return await fetchJson<PractitionerEntry>(`${API_BASE}/practitioners`, {
        method: 'POST',
        body: JSON.stringify(entry),
      });
    } catch {
      const af = MOCK_ARCHIVE_DATA.art_forms.find((a) => a.id === entry.art_form_id);
      const newEntry: PractitionerEntry = {
        id: Date.now(),
        art_form_id: entry.art_form_id,
        art_form_name: af?.name || 'Traditional Art Form',
        art_form_slug: af?.slug || '',
        contributor_name: entry.contributor_name,
        role_or_title: entry.role_or_title,
        community_affiliation: entry.community_affiliation,
        location: entry.location,
        title: entry.title,
        content: entry.content,
        lineage_tradition: entry.lineage_tradition,
        media_url: entry.media_url,
        information_layer: 'COMMUNITY',
        verification_status: 'COMMUNITY_VETTED',
        created_at: new Date().toISOString(),
      };
      saveLocalPractitioner(newEntry);
      return newEntry;
    }
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
        art_forms: res.art_forms.map(formatArtForm),
        artifacts: res.artifacts.map(formatArtifact),
      };
    } catch {
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
      MOCK_ARCHIVE_DATA.art_forms.forEach((af) => {
        (af.canonical_motifs || []).forEach((m) => {
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
  },

  // AI Cultural Intelligence
  askSanskruti: async (question: string, artFormSlug?: string): Promise<AskSanskrutiResponse> => {
    const geminiKey = geminiAuth.getKey();

    // Identify target art form context
    const targetSlug =
      artFormSlug ||
      MOCK_ARCHIVE_DATA.art_forms.find((af) =>
        question.toLowerCase().includes(af.slug.toLowerCase()) ||
        question.toLowerCase().includes(af.name.toLowerCase()) ||
        question.toLowerCase().includes(af.region.toLowerCase())
      )?.slug ||
      'madhubani';

    const af =
      MOCK_ARCHIVE_DATA.art_forms.find((a) => a.slug === targetSlug) ||
      MOCK_ARCHIVE_DATA.art_forms[0];

    const motifsList = af.canonical_motifs || [];
    const materialsList = af.traditional_materials || [];
    const sourcesList = af.sources || [];

    const relatedArtifacts = (MOCK_ARCHIVE_DATA.artifacts as unknown as ArtifactDetail[])
      .filter((art) => art.art_form_id === af.id)
      .slice(0, 4)
      .map((art) => ({
        id: art.id,
        accession_number: art.accession_number,
        title: art.title,
        art_form_name: af.name,
        information_layer: art.information_layer,
        image_url: formatMediaUrl(art.image_url),
      }));

    const citedSources = sourcesList.map((s) => ({
      title: s.title,
      author: s.author || 'Sanskruti Archival Research Team',
      year: s.year || 'Historical Documentation',
      archive_institution: s.archive_institution || 'National Crafts Archive',
      citation_type: s.citation_type || 'Scholarly Monograph',
      layer: 'VERIFIED',
    }));

    // If Gemini API Key is present, make direct Gemini API call
    if (geminiKey) {
      try {
        const motifsContext = motifsList
          .map((m) => `- ${m.name}: ${m.symbolism} (Visual cue: ${m.visual_cue})`)
          .join('\n');
        const materialsContext = materialsList
          .map((mat) => `- ${mat.name} (${mat.category}): Source: ${mat.natural_source}. Preparation: ${mat.preparation || 'N/A'}`)
          .join('\n');
        const sourcesContext = sourcesList
          .map((s) => `- ${s.title} (${s.author || 'Archival Board'}, ${s.year || 'N/A'}) - ${s.archive_institution || ''}`)
          .join('\n');

        const systemPrompt = `You are the Sanskruti Cultural Intelligence AI, grounded in the Digital Cultural Art Archive of India.
STRICT CULTURAL ARCHIVAL RULES:
1. Answer with cultural reverence, scholarly precision, and strict grounding in the provided archival context.
2. Distinguish clearly between (A) Verified Archival Knowledge, (B) Community & Practitioner Lineages, and (C) AI Cultural Interpretation.
3. State exact traditional materials, canonical motifs, and sacred ritual contexts as documented in the records.
4. Do NOT hallucinate dates, unverified legends, or modern commercial reinterpretations as ancient fact.
5. Ground your answer in the archival records of ${af.name} (${af.native_name || ''}).`;

        const userPrompt = `ARCHIVAL GROUNDING CONTEXT FOR ${af.name.toUpperCase()}:
- Category: ${af.category}
- Region & States: ${af.region} (${af.states.join(', ')})
- Historical Origin: ${af.period_origin}
- Preservation Status: ${af.preservation_status}
- Summary: ${af.summary}
- Historical Context: ${af.historical_context}
- Sacred Ritual Context: ${af.ritual_context}
- Canonical Motifs:
${motifsContext}
- Traditional Materials:
${materialsContext}
- Verified Primary Sources:
${sourcesContext}

USER QUESTION:
"${question}"

Please provide a comprehensive, structured response grounded in the archival knowledge above. Include:
1. Historical & Regional Foundation
2. Sacred & Ritual Significance
3. Canonical Iconography & Motifs
4. Traditional Natural Mediums & Technique
5. Cultural Archival Notes and Citations`;

        // Try gemini-2.0-flash first, then fallback to gemini-1.5-flash
        const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
        let geminiResponseText = '';

        for (const model of models) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
                  },
                ],
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 2048,
                },
              }),
            });

            if (res.ok) {
              const data = await res.json();
              geminiResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (geminiResponseText) break;
            }
          } catch {
            // try next model
          }
        }

        if (geminiResponseText) {
          return {
            question,
            answer: geminiResponseText,
            information_layer: 'AI_INTERPRETATION',
            model_used: 'Google Gemini 2.0 Flash (Grounded via Sanskruti Archival RAG)',
            is_grounded: true,
            context_art_form: af.name,
            sources_cited: citedSources,
            grounded_artifacts: relatedArtifacts,
            disclaimer:
              'Response generated using Google Gemini 2.0 Flash, grounded strictly in Sanskruti digital archive records and verified master artisan traditions.',
          };
        }
      } catch (err) {
        console.warn('Direct Gemini call failed, falling back to local synthesizer:', err);
      }
    }

    // Try backend API if available
    try {
      const res = await fetchJson<AskSanskrutiResponse>(`${API_BASE}/ai/ask`, {
        method: 'POST',
        body: JSON.stringify({
          question,
          art_form_slug: artFormSlug || null,
        }),
      });
      return {
        ...res,
        grounded_artifacts: res.grounded_artifacts.map((a) => ({
          ...a,
          image_url: formatMediaUrl(a.image_url),
        })),
      };
    } catch {
      // Fallback: Grounded offline archival intelligence synthesis
      const motifsFormatted = motifsList
        .slice(0, 3)
        .map((m) => `• **${m.name}**: ${m.symbolism} (*Visual Cue:* ${m.visual_cue})`)
        .join('\n');

      const materialsFormatted = materialsList
        .slice(0, 3)
        .map((mat) => `• **${mat.name}** (${mat.category}): Sourced from ${mat.natural_source}. ${mat.preparation || ''}`)
        .join('\n');

      const answer = `### Archival Grounding: ${af.name} (${af.native_name || ''})

**Historical & Regional Context:**
${af.historical_context}

**Sacred & Ritual Significance:**
${af.ritual_context}

**Canonical Iconography & Motifs:**
${motifsFormatted}

**Natural Indigenous Mediums:**
${materialsFormatted}

**Archival Epistemic Note:**
This interpretation is strictly grounded in verified Layer A archival accessions (National Crafts Museum, IGNCA) and living practitioner lore. Connect your Gemini API Key in the console above to enable dynamic generative synthesis.`;

      return {
        question,
        answer,
        information_layer: 'AI_INTERPRETATION',
        model_used: 'Sanskruti Archival Grounding Engine (Grounded Repository)',
        is_grounded: true,
        context_art_form: af.name,
        sources_cited: citedSources,
        grounded_artifacts: relatedArtifacts,
        disclaimer:
          'Responses are grounded strictly in peer-reviewed archival records and documented master artisan traditions under Sanskruti Four-Layer Epistemic Integrity.',
      };
    }
  },

  getSuggestedInquiries: async (): Promise<Array<{ art_form_slug: string; question: string; topic: string }>> => {
    try {
      return await fetchJson(`${API_BASE}/ai/suggested-inquiries`);
    } catch {
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
  },

  // Stats
  getStats: async (): Promise<ArchiveStats> => {
    try {
      return await fetchJson<ArchiveStats>(`${API_BASE}/stats`);
    } catch {
      return MOCK_ARCHIVE_DATA.stats as unknown as ArchiveStats;
    }
  },
};
