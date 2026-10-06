import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Sparkles,
  Layers,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
          Archival Philosophy & Manifesto
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-100">
          The Archival Integrity Foundation
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          Why Sanskriti is first and foremost a digital archive, and how structured cultural knowledge governs ethical artificial intelligence.
        </p>
      </div>

      {/* CORE HIERARCHY DIAGRAM */}
      <section className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-cultural space-y-8">
        <div>
          <span className="text-xs font-mono uppercase text-amber-400 font-bold">Principle 1</span>
          <h2 className="font-serif text-2xl font-bold text-slate-100 mt-1">
            The Foundational Architectural Hierarchy
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            AI is NOT the foundation of Sanskriti. The archive must remain fully functional and invaluable even if every AI feature is temporarily disconnected.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-amber-500/20 text-amber-300 font-bold">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">1</span>
            <span>DIGITAL ARCHIVE (Primary Artifacts, Provenance, High-Res Media, Citations)</span>
          </div>

          <div className="text-center text-slate-500 font-sans">↓ drives</div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-amber-500/20 text-slate-200 font-bold">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">2</span>
            <span>STRUCTURED CULTURAL KNOWLEDGE (Canonical Motifs, Materials Chemistry, Sacred Rites)</span>
          </div>

          <div className="text-center text-slate-500 font-sans">↓ enables</div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-amber-500/20 text-slate-200 font-bold">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">3</span>
            <span>SEARCH / DISCOVERY / EXPLORATION (Multi-faceted, Regional, Layer Filters)</span>
          </div>

          <div className="text-center text-slate-500 font-sans">↓ informs</div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-300 font-bold">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">4</span>
            <span>AI INTELLIGENCE LAYER (Grounded Consultation, Transparent Source Citations)</span>
          </div>
        </div>
      </section>

      {/* FOUR INFORMATION LAYERS IN DEPTH */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-mono uppercase text-amber-400 font-bold">Principle 2</span>
          <h2 className="font-serif text-3xl font-bold text-slate-100 mt-1">
            The Four Discrete Information Layers
          </h2>
          <p className="text-sm text-slate-300 mt-2">
            We never silently mix knowledge categories. A historical fact must never appear as an AI claim, and AI art must never masquerade as authentic traditional craftsmanship.
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-serif text-lg font-bold text-emerald-300">
                Layer A: Verified / Archival Knowledge
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Information collected exclusively from documented, credible primary sources: published academic monographs, museum registry accessions (National Crafts Museum, IGNCA, Calico Museum), and peer-documented archaeological surveys. Every record possesses an author, date, and institution citation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-sky-950/20 border border-sky-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              <h3 className="font-serif text-lg font-bold text-sky-300">
                Layer B: Community / Practitioner Knowledge
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Oral lore, pigment preparation recipes, ceremonial rules, and hereditary practices contributed directly by practicing artisans and community culture bearers. Preserves unwritten procedural memory passed down through guru-shishya lineages.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="font-serif text-lg font-bold text-purple-300">
                Layer C: AI Cultural Interpretation
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Analytical explanations, comparative motif synthesis, and interactive answering generated by AI utilizing Layers A and B as grounding context. Every response explicitly provides citations and notes its AI origin.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif text-lg font-bold text-amber-300">
                Layer D: AI-Generated Creative Content
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Experimental or generative imagery synthesized by algorithmic models. It is strictly tagged as synthetic and never presented as an authentic traditional artifact or cultural relic.
            </p>
          </div>
        </div>
      </section>

      {/* EXTENSIBLE DATA ARCHITECTURE */}
      <section className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs text-slate-300">
        <h3 className="font-serif text-xl font-bold text-slate-100 flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-400" />
          <span>Extensible, Codebase-Agnostic Architecture</span>
        </h3>
        <p className="leading-relaxed">
          The Sanskruti data model is designed to support additional art forms (such as Chittara, Sohrai, Cheriyal scrolls, Rogan art, or Thangka) without requiring code modifications. All canonical motifs, traditional pigments, techniques, and citations are stored as structured JSON and relational schemas in the database.
        </p>
      </section>

      {/* CALL TO ACTION */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-950 border border-amber-500/30 text-center space-y-4">
        <h3 className="font-serif text-2xl font-bold text-slate-100">
          Experience the Archive in Action
        </h3>
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          Explore the 8 initial visual art form dossiers, inspect verified artifact catalog sheets, or test grounded AI consultation.
        </p>
        <div className="pt-2 flex justify-center gap-4">
          <Link
            to="/explore"
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all"
          >
            Explore Digital Archive
          </Link>
          <Link
            to="/ask"
            className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-all"
          >
            Launch Ask Sanskruti AI
          </Link>
        </div>
      </div>

    </div>
  );
};
