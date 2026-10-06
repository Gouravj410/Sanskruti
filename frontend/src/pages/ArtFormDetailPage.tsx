import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Layers,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Users,
  Feather,
  Hammer,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { api } from '../services/api';
import { ArtFormDetail, ArtifactSummary, PractitionerEntry, AskSanskrutiResponse } from '../types';
import { PreservationBadge } from '../components/common/PreservationBadge';
import { ArtifactCard } from '../components/common/ArtifactCard';
import { LayerBadge } from '../components/common/LayerBadge';

export const ArtFormDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [artForm, setArtForm] = useState<ArtFormDetail | null>(null);
  const [artifacts, setArtifacts] = useState<ArtifactSummary[]>([]);
  const [practitioners, setPractitioners] = useState<PractitionerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Embedded Ask Sanskruti State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AskSanskrutiResponse | null>(null);

  useEffect(() => {
    if (!slug) return;
    const loadDossier = async () => {
      setLoading(true);
      try {
        const [detail, artifactsList, practitionersList] = await Promise.all([
          api.getArtFormBySlug(slug),
          api.getArtifacts({ art_form_slug: slug }),
          api.getPractitioners({ art_form_slug: slug }),
        ]);
        setArtForm(detail);
        setArtifacts(artifactsList);
        setPractitioners(practitionersList);
      } catch (err) {
        console.error('Failed to load art form dossier:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDossier();
  }, [slug]);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || !slug) return;
    setAiLoading(true);
    try {
      const res = await api.askSanskruti(aiQuestion.trim(), slug);
      setAiResponse(res);
    } catch (err) {
      console.error('AI Consultation failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="font-serif text-xl text-amber-300 animate-pulse">
          Opening Digital Archival Dossier...
        </p>
      </div>
    );
  }

  if (!artForm) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-2xl text-slate-100">Dossier Not Found</h2>
        <p className="text-slate-400 mt-2">The requested art form is not currently cataloged in the archive.</p>
        <Link to="/explore" className="mt-4 inline-block text-amber-400 hover:underline">
          Return to Archive Explorer
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      {/* DOSSIER HERO BANNER */}
      <section className="relative overflow-hidden bg-slate-950 border-b border-amber-500/20">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src={artForm.banner_image_url || artForm.cover_image_url}
            alt={artForm.name}
            className="w-full h-full object-cover filter blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-slate-900/90 text-amber-300 border border-amber-500/30">
              {artForm.category}
            </span>
            <PreservationBadge status={artForm.preservation_status} />
            <span className="text-xs text-slate-400 font-mono">
              Accession Code: SAN-{artForm.slug.toUpperCase()}
            </span>
          </div>

          <div className="max-w-4xl">
            {artForm.native_name && (
              <span className="font-serif text-xl sm:text-2xl text-amber-300/80 block mb-1">
                {artForm.native_name}
              </span>
            )}
            <h1 className="font-serif text-4xl sm:text-6xl font-bold text-slate-100 leading-tight">
              {artForm.name}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mt-4 leading-relaxed">
              {artForm.summary}
            </p>
          </div>

          {/* Quick Meta Row */}
          <div className="mt-8 flex flex-wrap gap-6 text-xs text-slate-300 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>
                <strong>Region:</strong> {artForm.region} ({artForm.states.join(', ')})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>
                <strong>Origin Period:</strong> {artForm.period_origin}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>Cataloged Artifacts:</strong> {artifacts.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* SECTION 1: HISTORICAL CONTEXT & SACRED RITUAL CONTEXT */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-cultural flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 mb-3">
                <BookOpen className="w-5 h-5" />
                <h2 className="font-serif text-xl font-bold uppercase tracking-wider">
                  Historical Foundation
                </h2>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {artForm.historical_context}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 italic">
              Archival Layer A • Sourced from academic monographs & field ethnography
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-cultural flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 mb-3">
                <Feather className="w-5 h-5" />
                <h2 className="font-serif text-xl font-bold uppercase tracking-wider">
                  Ritual & Sacred Context
                </h2>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {artForm.ritual_context}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 italic">
              Living Spiritual Tradition • Ceremonial lifecycle & community performance
            </div>
          </div>
        </section>

        {/* SECTION 2: CANONICAL MOTIFS VISUAL GUIDE */}
        <section className="space-y-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
              Visual Syntax
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-100 mt-1">
              Canonical Motifs & Sacred Iconography
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Symbolic lexicon and geometric cues documented in hereditary canonical treatises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {artForm.canonical_motifs.map((motif, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Motif #{idx + 1}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-amber-200">
                    {motif.name}
                  </h3>
                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <strong className="text-slate-200 block">Symbolism:</strong>
                      <span className="text-slate-400">{motif.symbolism}</span>
                    </div>
                    <div>
                      <strong className="text-slate-200 block">Visual Identification Cue:</strong>
                      <span className="text-slate-400 italic">{motif.visual_cue}</span>
                    </div>
                  </div>
                </div>
                {motif.cultural_meaning && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-amber-400/80">
                    {motif.cultural_meaning}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: TRADITIONAL MATERIALS & NATURAL PIGMENTS */}
        <section className="space-y-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
              Indigenous Chemistry
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-100 mt-1">
              Traditional Materials & Mineral Pigments
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Organic, vegetal, and mineral media prepared with ancestral recipes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artForm.traditional_materials.map((mat, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {mat.category}
                  </span>
                </div>
                <h4 className="font-serif text-base font-bold text-amber-100">
                  {mat.name}
                </h4>
                <div className="mt-2 space-y-1 text-xs text-slate-400">
                  <p>
                    <strong className="text-slate-300">Natural Source:</strong> {mat.natural_source}
                  </p>
                  {mat.preparation && (
                    <p>
                      <strong className="text-slate-300">Preparation:</strong> {mat.preparation}
                    </p>
                  )}
                  {mat.purpose && (
                    <p>
                      <strong className="text-slate-300">Purpose:</strong> {mat.purpose}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: STEP-BY-STEP HEREDITARY TECHNIQUES */}
        <section className="space-y-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
              Artisan Praxis
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-100 mt-1">
              Hereditary Production Techniques
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {artForm.techniques.map((step) => (
              <div key={step.step_order} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative">
                <span className="text-3xl font-serif font-black text-amber-500/20 absolute top-4 right-4">
                  0{step.step_order}
                </span>
                <h4 className="font-serif text-lg font-bold text-slate-100 mb-2">
                  {step.name}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {step.description}
                </p>
                {step.tool && (
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-xs text-amber-400">
                    <Hammer className="w-3.5 h-3.5" />
                    <span>Tool: {step.tool}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: VERIFIED ARTIFACTS GALLERY */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
                Primary Records
              </span>
              <h2 className="font-serif text-3xl font-bold text-slate-100 mt-1">
                Archival Artifacts Catalog ({artifacts.length})
              </h2>
            </div>
          </div>

          {artifacts.length === 0 ? (
            <p className="text-slate-400 text-sm italic">No individual artifacts cataloged yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artifacts.map((art) => (
                <ArtifactCard key={art.id} artifact={art} />
              ))}
            </div>
          )}
        </section>

        {/* SECTION 6: PRACTITIONER & COMMUNITY ORAL TRADITION */}
        {practitioners.length > 0 && (
          <section className="space-y-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-sky-400">
                Layer B • Living Heritage
              </span>
              <h2 className="font-serif text-3xl font-bold text-slate-100 mt-1">
                Practitioner Lineages & Oral Lore
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                First-person oral histories and hereditary knowledge contributed by master practitioners.
              </p>
            </div>

            <div className="space-y-4">
              {practitioners.map((pe) => (
                <div
                  key={pe.id}
                  className="p-6 rounded-2xl bg-sky-950/20 border border-sky-500/30 text-slate-200"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sky-300 text-lg">
                        {pe.contributor_name}
                      </span>
                      <span className="text-xs text-slate-400">• {pe.role_or_title}</span>
                      <span className="text-xs text-slate-400">({pe.location})</span>
                    </div>
                    <LayerBadge layer={pe.information_layer} size="sm" />
                  </div>

                  <h4 className="font-serif text-base font-semibold text-amber-200 mb-2">
                    "{pe.title}"
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-sky-500/50 pl-4 py-1">
                    "{pe.content}"
                  </p>

                  {pe.lineage_tradition && (
                    <div className="mt-3 text-[11px] text-slate-400">
                      <strong>Hereditary Lineage:</strong> {pe.lineage_tradition}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 7: ACADEMIC CITATIONS & ARCHIVAL SOURCES */}
        <section className="space-y-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
              Archival Bibliography
            </span>
            <h2 className="font-serif text-2xl font-bold text-slate-100 mt-1">
              Verified Academic Sources & Institutional Records
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Title / Monograph</th>
                  <th className="px-6 py-4">Author / Researcher</th>
                  <th className="px-6 py-4">Year</th>
                  <th className="px-6 py-4">Archival Institution</th>
                  <th className="px-6 py-4">Citation ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {artForm.sources.map((src, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-amber-200">{src.title}</td>
                    <td className="px-6 py-4 text-slate-300">{src.author || 'Archival Board'}</td>
                    <td className="px-6 py-4 font-mono">{src.year || 'Historical'}</td>
                    <td className="px-6 py-4 text-slate-400">{src.archive_institution || 'National Archive'}</td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">{src.isbn_or_url || 'REGISTERED'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 8: EMBEDDED ASK SANSKRUTI ABOUT THIS ART FORM */}
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 shadow-cultural-lg space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h2 className="font-serif text-2xl font-bold text-slate-100">
              Consult Ask Sanskruti on {artForm.name}
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-3xl">
            Inquire directly regarding {artForm.name}. The AI reasoning will be strictly grounded in the verified archival dossier above, citing exact monographs and cataloged records.
          </p>

          <form onSubmit={handleAskAI} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder={`e.g. What is the sacred meaning of the ${artForm.canonical_motifs[0]?.name || 'primary motifs'}?`}
                className="flex-1 px-4 py-3 text-sm bg-slate-950 border border-purple-500/30 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40"
              />
              <button
                type="submit"
                disabled={aiLoading || !aiQuestion.trim()}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
              >
                {aiLoading ? (
                  <span>Synthesizing...</span>
                ) : (
                  <>
                    <span>Ask AI</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* AI Response Card */}
          {aiResponse && (
            <div className="mt-6 p-6 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <LayerBadge layer={aiResponse.information_layer} size="sm" />
                  <span className="text-xs text-slate-400 font-mono">
                    Model: {aiResponse.model_used}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Archival Grounded</span>
                </span>
              </div>

              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {aiResponse.answer}
              </div>

              {/* Cited Sources */}
              {aiResponse.sources_cited && aiResponse.sources_cited.length > 0 && (
                <div className="pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold block mb-2">
                    Verified Citations Grounding This Response:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {aiResponse.sources_cited.map((c, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300"
                      >
                        📚 {c.title} ({c.author || 'Archive'}, {c.year || 'Historic'})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="text-[10px] text-slate-500 italic pt-2">
                {aiResponse.disclaimer}
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};
