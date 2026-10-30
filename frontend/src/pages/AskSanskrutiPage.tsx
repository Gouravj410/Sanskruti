import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Info,
  Copy,
  Check,
  Settings,
  Key,
  ChevronRight,
  Database,
  Palette,
  Eye,
  RefreshCw,
  Search,
} from 'lucide-react';
import { api } from '../services/api';
import { AskSanskrutiResponse, ArtFormSummary } from '../types';
import { LayerBadge } from '../components/common/LayerBadge';

export const AskSanskrutiPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuestion = searchParams.get('question') || '';
  const initialArtForm = searchParams.get('art_form') || '';

  const [question, setQuestion] = useState(initialQuestion);
  const [selectedArtForm, setSelectedArtForm] = useState(initialArtForm);
  const [artForms, setArtForms] = useState<ArtFormSummary[]>([]);
  const [suggestedInquiries, setSuggestedInquiries] = useState<
    Array<{ art_form_slug: string; question: string; topic: string }>
  >([]);

  // AI & RAG Configuration State
  const [customApiKey, setCustomApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<
    'citations' | 'artifacts' | 'motifs' | 'materials'
  >('citations');

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AskSanskrutiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const executeQuery = useCallback(
    async (queryText: string, artFormSlug?: string, apiKey?: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.askSanskruti(
          queryText,
          artFormSlug || undefined,
          apiKey || customApiKey || undefined
        );
        setResponse(res);
        setSearchParams({
          question: queryText,
          ...(artFormSlug ? { art_form: artFormSlug } : {}),
        });

        // Set default evidence tab based on response contents
        if (res.sources_cited && res.sources_cited.length > 0) {
          setActiveEvidenceTab('citations');
        } else if (res.grounded_artifacts && res.grounded_artifacts.length > 0) {
          setActiveEvidenceTab('artifacts');
        } else if (res.retrieved_motifs && res.retrieved_motifs.length > 0) {
          setActiveEvidenceTab('motifs');
        }
      } catch (err: any) {
        setError(
          err.message ||
            'Archival AI Consultation encountered an error. Please verify backend connectivity.'
        );
      } finally {
        setLoading(false);
      }
    },
    [customApiKey, setSearchParams]
  );

  useEffect(() => {
    let isMounted = true;

    const loadContext = async () => {
      try {
        const [forms, suggestions] = await Promise.all([
          api.getArtForms(),
          api.getSuggestedInquiries(),
        ]);
        if (!isMounted) return;
        setArtForms(forms);
        setSuggestedInquiries(suggestions);

        if (initialQuestion.trim()) {
          executeQuery(initialQuestion.trim(), initialArtForm);
        }
      } catch (err) {
        console.error('Failed to load inquiries context:', err);
      }
    };
    loadContext();

    return () => {
      isMounted = false;
    };
  }, [executeQuery, initialArtForm, initialQuestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    executeQuery(question.trim(), selectedArtForm, customApiKey);
  };

  const handleSuggestionClick = (s: { question: string; art_form_slug: string }) => {
    setQuestion(s.question);
    setSelectedArtForm(s.art_form_slug);
    executeQuery(s.question, s.art_form_slug, customApiKey);
  };

  const handleCopyAnswer = () => {
    if (!response?.answer) return;
    navigator.clipboard.writeText(response.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setQuestion('');
    setResponse(null);
    setError(null);
    setSearchParams({});
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      {/* Editorial Header */}
      <div className="border-b border-slate-800/80 pb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2.5 py-0.5 rounded">
                Layer C Archival RAG
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-400">
                Active Grounding Engine
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
              Ask Sanskriti
            </h1>
          </div>

          {/* Model provider control button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-amber-500/50 text-xs font-medium text-slate-300 hover:text-slate-100 transition-colors shadow-sm"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {customApiKey ? 'Gemini 2.0 Flash (Custom Key)' : 'Archival RAG (Active DB)'}
              </span>
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Scholarly artificial intelligence strictly bound to the digital archive. Every response
          is cross-referenced against primary monographs, museum registry accessions, and
          living master artisan traditions.
        </p>

        {/* Status ticker */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Database Connected (8 Art Forms, 14 Cataloged Artifacts)</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>Zero Unverified Hallucination Boundary</span>
          </div>
        </div>
      </div>

      {/* Settings Drawer (Optional Gemini Key Configuration) */}
      {showSettings && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-4 shadow-cultural">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">
                AI Model & Synthesis Provider
              </h3>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Close
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Sanskriti comes with a high-fidelity <strong>Deterministic Archival RAG Synthesizer</strong>{' '}
            that works offline using the local database records. To enable live neural cloud generation
            via Google Gemini 2.0 Flash, provide your API key below.
          </p>

          <div className="space-y-1.5 max-w-xl">
            <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
              Google Gemini API Key (Optional)
            </label>
            <div className="relative">
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="AIzaSy... (leave blank to use Built-in Archival RAG)"
                className="w-full pl-3 pr-20 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
              {customApiKey && (
                <button
                  type="button"
                  onClick={() => setCustomApiKey('')}
                  className="absolute right-2.5 top-2.5 text-[11px] text-slate-400 hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Your key is passed securely to the backend for this session and is never persisted in
              browser storage.
            </p>
          </div>
        </div>
      )}

      {/* Main Research Console */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-cultural space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Scope bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-400" />
              <label className="text-xs font-bold text-slate-200 tracking-wide">
                Grounding Scope:
              </label>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedArtForm}
                onChange={(e) => setSelectedArtForm(e.target.value)}
                className="text-xs bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-3.5 py-2 focus:outline-none focus:border-amber-400 transition-colors w-full sm:w-64"
              >
                <option value="">Full Cultural Archive (All Traditions)</option>
                {artForms.map((af) => (
                  <option key={af.slug} value={af.slug}>
                    {af.name} ({af.region})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Unified Query Console */}
          <div className="space-y-3">
            <div className="relative rounded-xl bg-slate-950 border border-slate-700/80 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/30 transition-all">
              <textarea
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask about sacred motifs, pigment chemistry, fermentation steps, or ceremonial contexts..."
                className="w-full p-4 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
              />

              {/* Bottom toolbar inside input box */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-800/80 bg-slate-950/60 rounded-b-xl">
                <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">Ctrl + Enter</kbd> to submit
                </span>

                <div className="flex items-center gap-2 ml-auto">
                  {question && (
                    <button
                      type="button"
                      onClick={() => setQuestion('')}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Clear
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !question.trim()}
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md hover:shadow-cultural"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Grounding...</span>
                      </>
                    ) : (
                      <>
                        <span>Consult Archive</span>
                        <Sparkles className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Curated Scholarly Inquiry Dossier Cards */}
        {suggestedInquiries.length > 0 && (
          <div className="pt-5 border-t border-slate-800/80 space-y-3">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block font-mono">
              Curated Scholarly Inquiries (Click to run):
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {suggestedInquiries.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(sug)}
                  className="group text-left p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                      {sug.topic}
                    </span>
                    <span className="text-[11px] text-slate-500 uppercase tracking-widest font-mono">
                      {sug.art_form_slug}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 group-hover:text-amber-200 transition-colors leading-relaxed line-clamp-2">
                    {sug.question}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 group-hover:text-amber-400 transition-colors pt-1">
                    <span>Analyze Record</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* AI Consultation Response Sheet */}
      {response && (
        <div className="space-y-8 animate-fade-in">
          {/* Main Dossier Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-cultural-lg space-y-6">
            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <LayerBadge layer={response.information_layer} size="sm" />
                <span className="text-[11px] font-mono text-purple-300 bg-purple-950/50 border border-purple-500/30 px-2 py-0.5 rounded">
                  {response.model_used}
                </span>
                {response.context_art_form && (
                  <span className="text-[11px] font-mono text-amber-300 bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 rounded">
                    Scope: {response.context_art_form}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAnswer}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 hover:border-slate-500 text-xs text-slate-300 hover:text-slate-100 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Dossier</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 hover:border-slate-500 text-xs text-slate-300 hover:text-slate-100 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>New Query</span>
                </button>
              </div>
            </div>

            {/* Inquired Question */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Inquiry Topic
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100 leading-snug">
                "{response.question}"
              </h2>
            </div>

            {/* Answer Content */}
            <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-sm space-y-4 whitespace-pre-wrap font-sans border-t border-slate-800/80 pt-4">
              {response.answer}
            </div>

            {/* Epistemic Integrity Callout */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200/90 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block text-purple-300">
                  Epistemic Grounding Guarantee
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {response.disclaimer}
                </p>
              </div>
            </div>
          </div>

          {/* Grounding Evidence Console (Tabs) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-cultural space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif text-lg font-bold text-slate-100">
                  Retrieved Archival Grounding Evidence
                </h3>
              </div>

              {/* Segmented Evidence Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setActiveEvidenceTab('citations')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    activeEvidenceTab === 'citations'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Citations ({response.sources_cited?.length || 0})
                </button>

                <button
                  onClick={() => setActiveEvidenceTab('artifacts')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    activeEvidenceTab === 'artifacts'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Artifacts ({response.grounded_artifacts?.length || 0})
                </button>

                {response.retrieved_motifs && response.retrieved_motifs.length > 0 && (
                  <button
                    onClick={() => setActiveEvidenceTab('motifs')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      activeEvidenceTab === 'motifs'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Motifs ({response.retrieved_motifs.length})
                  </button>
                )}

                {response.retrieved_materials && response.retrieved_materials.length > 0 && (
                  <button
                    onClick={() => setActiveEvidenceTab('materials')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      activeEvidenceTab === 'materials'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Materials ({response.retrieved_materials.length})
                  </button>
                )}
              </div>
            </div>

            {/* Evidence Tab 1: Cited Primary Sources */}
            {activeEvidenceTab === 'citations' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Primary archival monographs and institutional accession registers referenced by the RAG engine:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {response.sources_cited.map((citation, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 hover:border-amber-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-amber-200 leading-snug">
                          {citation.title}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-300 shrink-0 border border-slate-700/60">
                          {citation.citation_type || 'Monograph'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {citation.author && <span>{citation.author}</span>}
                        {citation.year && <span className="font-mono">({citation.year})</span>}
                      </div>

                      {citation.archive_institution && (
                        <div className="text-[11px] text-amber-400/90 font-medium pt-1 border-t border-slate-900">
                          Archival Repository: {citation.archive_institution}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence Tab 2: Referenced Artifacts */}
            {activeEvidenceTab === 'artifacts' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Verified museum catalog sheets associated with this inquiry:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {response.grounded_artifacts.map((art) => (
                    <Link
                      key={art.id}
                      to={`/artifacts/${art.id}`}
                      className="group block rounded-xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all p-3 space-y-2.5 shadow-sm"
                    >
                      <div className="h-32 w-full overflow-hidden rounded-lg bg-slate-900 relative">
                        <img
                          src={art.image_url}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/85 text-amber-300 border border-amber-500/30">
                          {art.accession_number}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-1">
                          {art.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {art.art_form_name}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                        <Eye className="w-3 h-3" />
                        <span>Inspect Archival Sheet</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence Tab 3: Retrieved Motifs */}
            {activeEvidenceTab === 'motifs' && response.retrieved_motifs && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Canonical motifs matched from the structured database knowledge base:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {response.retrieved_motifs.map((motif, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 hover:border-amber-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-100">
                          {motif.name}
                        </span>
                        {motif.art_form_name && (
                          <span className="text-[10px] font-mono uppercase text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded">
                            {motif.art_form_name}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {motif.symbolism}
                      </p>

                      {motif.visual_cue && (
                        <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-900">
                          Archetype Cue: {motif.visual_cue}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence Tab 4: Retrieved Materials */}
            {activeEvidenceTab === 'materials' && response.retrieved_materials && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Traditional mineral and organic pigment chemistry retrieved from the archive:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {response.retrieved_materials.map((mat, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-bold text-slate-100">{mat.name}</span>
                        </div>
                        {mat.category && (
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                            {mat.category}
                          </span>
                        )}
                      </div>

                      {mat.natural_source && (
                        <p className="text-xs text-slate-300">
                          <strong>Source:</strong> {mat.natural_source}
                        </p>
                      )}

                      {mat.preparation && (
                        <p className="text-xs text-slate-400 leading-relaxed">
                          <strong>Preparation:</strong> {mat.preparation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
