import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  Users,
  Compass,
  ArrowRight,
  Layers,
  MapPin,
  Flame,
  Award,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';
import { ArtFormSummary, ArtifactSummary, ArchiveStats } from '../types';
import { ArtFormCard } from '../components/common/ArtFormCard';
import { ArtifactCard } from '../components/common/ArtifactCard';
import { LayerBadge } from '../components/common/LayerBadge';

export const HomePage: React.FC = () => {
  const [artForms, setArtForms] = useState<ArtFormSummary[]>([]);
  const [featuredArtifacts, setFeaturedArtifacts] = useState<ArtifactSummary[]>([]);
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [formsData, artifactsData, statsData] = await Promise.all([
          api.getArtForms(),
          api.getArtifacts({ is_featured: true, limit: 6 }),
          api.getStats(),
        ]);
        setArtForms(formsData);
        setFeaturedArtifacts(artifactsData);
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load home page archival records:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-16 pb-24 overflow-hidden border-b border-amber-500/15">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-amber-600/15 via-rose-600/10 to-indigo-600/15 blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Core Philosophy Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-8 shadow-cultural backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Digital Archive First • Structured Cultural Knowledge • AI Intelligence Layer</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-100 max-w-5xl mx-auto leading-[1.1]">
            Safeguarding India's <br />
            <span className="text-gold-gradient">Traditional Visual Heritage</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Sanskriti is an authoritative digital archival repository documenting classical Indian folk and tribal art forms—their sacred geometry, canonical motifs, ritual contexts, and indigenous materials—grounding modern AI intelligence directly in verified archival truth.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/explore"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 font-bold text-sm shadow-cultural-lg hover:brightness-110 hover:scale-105 transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Digital Archive</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/ask"
              className="px-6 py-3.5 rounded-xl bg-slate-900 border border-purple-500/40 text-purple-200 font-bold text-sm hover:bg-purple-950/40 hover:border-purple-400 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Ask Sanskruti AI Console</span>
            </Link>

            <Link
              to="/about"
              className="px-5 py-3.5 rounded-xl bg-slate-900/60 border border-slate-700/80 text-slate-300 font-medium text-sm hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>4-Layer Integrity</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          {stats && (
            <div className="mt-16 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-cultural">
              <div className="text-center p-2">
                <span className="block font-serif text-3xl font-extrabold text-amber-300">
                  {stats.total_art_forms}
                </span>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Art Traditions</span>
              </div>
              <div className="text-center p-2 border-l border-slate-800">
                <span className="block font-serif text-3xl font-extrabold text-emerald-300">
                  {stats.total_artifacts}
                </span>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Archival Records</span>
              </div>
              <div className="text-center p-2 border-l border-slate-800">
                <span className="block font-serif text-3xl font-extrabold text-amber-400">
                  {stats.total_motifs}
                </span>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Canonical Motifs</span>
              </div>
              <div className="text-center p-2 border-l border-slate-800">
                <span className="block font-serif text-3xl font-extrabold text-sky-400">
                  {stats.represented_states}
                </span>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">States Preserved</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CORE PRODUCT PHILOSOPHY & 4-LAYER INTEGRITY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/20 shadow-cultural">
          <div className="max-w-3xl mb-8">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
              Epistemic Principle
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
              Four Strictly Separated Information Layers
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              To honor traditional heritage and prevent generative distortion, Sanskriti enforces strict isolation between archival facts, community lore, and AI reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-emerald-400">LAYER A</span>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-serif text-base font-bold text-emerald-200">
                  Verified Archival Knowledge
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Information documented from verified primary sources, peer-reviewed publications, and national museum registries.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-500/20 text-[11px] font-medium text-emerald-400">
                100% Sourced & Cited
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-sky-950/20 border border-sky-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-sky-400">LAYER B</span>
                  <Users className="w-5 h-5 text-sky-400" />
                </div>
                <h3 className="font-serif text-base font-bold text-sky-200">
                  Practitioner Knowledge
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Oral histories, hereditary rules, and secret recipes shared by indigenous master artisans and culture bearers.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-sky-500/20 text-[11px] font-medium text-sky-400">
                Living Tradition Lineages
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-purple-400">LAYER C</span>
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-serif text-base font-bold text-purple-200">
                  AI Cultural Interpretation
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Computational analysis, cross-tradition pattern matching, and RAG inquiries grounded directly in Layer A.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-purple-500/20 text-[11px] font-medium text-purple-400">
                Transparent Citations
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-amber-400">LAYER D</span>
                  <Layers className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-serif text-base font-bold text-amber-200">
                  AI Creative Content
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Algorithmic artistic generations, never conflated with or presented as authentic heritage artifacts.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-500/20 text-[11px] font-medium text-amber-400">
                Strict Non-Conflation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED ART TRADITIONS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
              Living Heritage
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 mt-1">
              Initial Visual Art Form Archives
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">
              Extensible, data-driven archive architecture housing canonical records across geometric floor arts, tribal murals, scroll narratives, and mineral textiles.
            </p>
          </div>
          <Link
            to="/explore"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 uppercase tracking-wider"
          >
            <span>View All Traditions</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-slate-900 border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artForms.map((af) => (
              <ArtFormCard key={af.id} artForm={af} />
            ))}
          </div>
        )}
      </section>

      {/* CANONICAL MOTIF HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-cultural">
          <div className="max-w-3xl mb-10">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
              Visual Syntax
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-100 mt-1">
              Canonical Motifs & Sacred Iconography
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Every curve and grid in traditional Indian art encodes metaphysical meaning. Explore a selection of curated canonical motifs documented in the archive:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950/70 border border-amber-500/20 hover:border-amber-400/50 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Kolam Tradition
                </span>
                <h3 className="font-serif text-lg font-bold text-amber-200 mt-3">
                  Brahma Mudi (Infinite Knot)
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  A single continuous loop line winding around a symmetric dot grid without beginning, end, or break. Topologically seals thresholds against malefic energy.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                Ethnomathematical Eulerian Cycle
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/70 border border-amber-500/20 hover:border-amber-400/50 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Mithila Painting
                </span>
                <h3 className="font-serif text-lg font-bold text-amber-200 mt-3">
                  Kohbar (Bridal Arbor Mandala)
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  A central bamboo stalk (Purusha) penetrating a lotus pond (Prakriti), accompanied by four concentric fish and turtles to bless matrimonial fertility.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                Cosmological Fertility Yantra
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/70 border border-amber-500/20 hover:border-amber-400/50 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Warli Murals
                </span>
                <h3 className="font-serif text-lg font-bold text-amber-200 mt-3">
                  Tarpa Dance Spiral
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  A centripetal human spiral moving to the wind-reed Tarpa, where dancers never face inward or turn their backs, celebrating agrarian collective solidarity.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                Cosmic Community Accord
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED ARCHIVAL ARTIFACTS GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
              Archival Registry
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 mt-1">
              Curated Archival Records
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">
              Each artifact possesses a unique accession number, precise medium description, and verified academic provenance.
            </p>
          </div>
          <Link
            to="/explore?tab=artifacts"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider"
          >
            <span>Browse All Records</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredArtifacts.map((art) => (
            <ArtifactCard key={art.id} artifact={art} />
          ))}
        </div>
      </section>

      {/* ASK SANSKRUTI AI PROMO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 p-8 sm:p-12 shadow-cultural-lg">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Grounded Cultural Intelligence</span>
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
              Inquire with <span className="text-purple-300">Ask Sanskruti</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
              Experience artificial intelligence strictly bound to cultural truth. Ask about ritual contexts, natural pigment chemistry, or mythological genealogies—and inspect the exact archival sources cited in every response.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/ask"
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>Launch Ask Sanskruti</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/contribute"
                className="px-5 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white font-medium text-sm transition-all"
              >
                <span>Contribute as Artisan or Scholar</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
