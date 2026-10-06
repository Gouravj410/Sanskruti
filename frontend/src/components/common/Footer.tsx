import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Sparkles, Wand2, Compass, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 mt-20">
      {/* Information Layer Integrity Banner */}
      <div className="border-b border-slate-800/60 bg-slate-900/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center md:text-left mb-4">
            <h4 className="text-xs uppercase tracking-widest text-amber-400 font-bold">
              Archival Information Architecture — 4 Discrete Knowledge Layers
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Sanskriti maintains strict epistemic boundaries. AI never masquerades as primary historical fact.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-emerald-300 block">Layer A: Verified Archive</span>
                <span className="text-[11px] text-slate-400">Documented from peer-reviewed monographs and museum registries.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-sky-950/20 border border-sky-500/20">
              <Users className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-sky-300 block">Layer B: Practitioner Knowledge</span>
                <span className="text-[11px] text-slate-400">Direct oral histories and technical lore from master artisan lineages.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-purple-950/20 border border-purple-500/20">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-purple-300 block">Layer C: AI Interpretation</span>
                <span className="text-[11px] text-slate-400">AI analysis strictly grounded in retrieved archival records with citations.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-950/20 border border-amber-500/20">
              <Wand2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-amber-300 block">Layer D: AI Creative Synthesis</span>
                <span className="text-[11px] text-slate-400">Exploratory algorithmic art; explicitly distinguished from authentic heritage.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-amber-200">SANSKRUTI</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              A digital archival sanctuary for the traditional visual arts and cultural knowledge systems of the Indian subcontinent.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-mono text-amber-500/80 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                v1.0.0 Architecture
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Core Visual Traditions
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/art-forms/kolam" className="hover:text-amber-300 transition-colors">Kolam (Tamil Nadu)</Link></li>
              <li><Link to="/art-forms/warli" className="hover:text-amber-300 transition-colors">Warli Murals (Maharashtra)</Link></li>
              <li><Link to="/art-forms/madhubani" className="hover:text-amber-300 transition-colors">Madhubani Painting (Bihar)</Link></li>
              <li><Link to="/art-forms/mandana" className="hover:text-amber-300 transition-colors">Mandana Floor Art (Rajasthan)</Link></li>
              <li><Link to="/art-forms/gond" className="hover:text-amber-300 transition-colors">Gond Painting (Madhya Pradesh)</Link></li>
              <li><Link to="/art-forms/pattachitra" className="hover:text-amber-300 transition-colors">Pattachitra Scrolls (Odisha)</Link></li>
              <li><Link to="/art-forms/kalamkari" className="hover:text-amber-300 transition-colors">Kalamkari Textiles (Andhra Pradesh)</Link></li>
              <li><Link to="/art-forms/phad" className="hover:text-amber-300 transition-colors">Phad Temple Scrolls (Rajasthan)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/explore" className="hover:text-amber-300 transition-colors">Digital Archive Explorer</Link></li>
              <li><Link to="/ask" className="hover:text-purple-300 transition-colors">Ask Sanskruti AI Console</Link></li>
              <li><Link to="/contribute" className="hover:text-sky-300 transition-colors">Practitioner Desk & Oral Lore</Link></li>
              <li><Link to="/about" className="hover:text-amber-300 transition-colors">Archival Principles & Manifesto</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Archival Standards & Sourcing
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              All initial records are sourced from recognized institutions: IGNCA, National Crafts Museum New Delhi, Calico Museum, and scholarly field monographs.
            </p>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-400">
              Preserving living heritage with ethical indigenous attribution.
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Sanskruti Cultural Archive. Built for cultural preservation.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            Engineered with scholarly integrity <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
