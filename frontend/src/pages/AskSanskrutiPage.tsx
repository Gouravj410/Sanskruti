import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  ShieldCheck,
  Search,
  ExternalLink,
  HelpCircle,
  ArrowRight,
  Info,
  Clock,
  Key,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Cpu,
  Zap,
} from 'lucide-react';
import { api, geminiAuth } from '../services/api';
import { AskSanskrutiResponse, ArtFormSummary } from '../types';
import { LayerBadge } from '../components/common/LayerBadge';

export const AskSanskrutiPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuestion = searchParams.get('question') || '';
  const initialArtForm = searchParams.get('art_form') || '';

  const [question, setQuestion] = useState(initialQuestion);
  const [selectedArtForm, setSelectedArtForm] = useState(initialArtForm);
  const [artForms, setArtForms] = useState<ArtFormSummary[]>([]);
  const [suggestedInquiries, setSuggestedInquiries] = useState<Array<{ art_form_slug: string; question: string; topic: string }>>([]);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AskSanskrutiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Gemini API Key Modal State
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [showKeyText, setShowKeyText] = useState(false);
  const [isKeyConnected, setIsKeyConnected] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  useEffect(() => {
    const isConn = geminiAuth.isConnected();
    setIsKeyConnected(isConn);
    if (isConn) {
      setGeminiKeyInput(geminiAuth.getKey());
    }

    const loadContext = async () => {
      try {
        const [forms, suggestions] = await Promise.all([
          api.getArtForms(),
          api.getSuggestedInquiries(),
        ]);
        setArtForms(forms);
        setSuggestedInquiries(suggestions);

        // If initial question provided in URL, auto-execute
        if (initialQuestion.trim()) {
          executeQuery(initialQuestion.trim(), initialArtForm);
        }
      } catch (err) {
        console.error('Failed to load inquiries:', err);
      }
    };
    loadContext();
  }, []);

  const executeQuery = async (queryText: string, artFormSlug?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.askSanskruti(queryText, artFormSlug || undefined);
      setResponse(res);
      setSearchParams({ question: queryText, ...(artFormSlug ? { art_form: artFormSlug } : {}) });
    } catch (err: any) {
      setError(err.message || 'AI Consultation encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    executeQuery(question.trim(), selectedArtForm);
  };

  const handleSuggestionClick = (s: { question: string; art_form_slug: string }) => {
    setQuestion(s.question);
    setSelectedArtForm(s.art_form_slug);
    executeQuery(s.question, s.art_form_slug);
  };

  const handleSaveGeminiKey = async () => {
    if (!geminiKeyInput.trim()) {
      geminiAuth.clearKey();
      setIsKeyConnected(false);
      setShowKeyModal(false);
      return;
    }

    setTestStatus('testing');
    const valid = await geminiAuth.testConnection(geminiKeyInput.trim());
    if (valid) {
      geminiAuth.setKey(geminiKeyInput.trim());
      setIsKeyConnected(true);
      setTestStatus('success');
      setTimeout(() => {
        setShowKeyModal(false);
        setTestStatus('idle');
      }, 1000);
    } else {
      setTestStatus('failed');
    }
  };

  const handleDisconnectKey = () => {
    geminiAuth.clearKey();
    setGeminiKeyInput('');
    setIsKeyConnected(false);
    setTestStatus('idle');
    setShowKeyModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Archival Retrieval-Augmented Generation (RAG)</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-100">
          Ask <span className="text-purple-300">Sanskruti</span>
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed">
          Consult cultural artificial intelligence strictly bound to archival truth. Every response is grounded in authentic monographs, museum registers, and living master artisan lore.
        </p>

        {/* AI Engine Status & Key Toggle Bar */}
        <div className="pt-2 flex items-center justify-center gap-3">
          {isKeyConnected ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold">Google Gemini 2.0 Flash Connected</span>
              <button
                onClick={() => setShowKeyModal(true)}
                className="ml-1 text-[11px] underline text-emerald-400 hover:text-emerald-200"
              >
                Configure
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-purple-500/30 text-purple-300 text-xs shadow-sm">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Sanskruti Archival RAG Active</span>
              <button
                onClick={() => setShowKeyModal(true)}
                className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-medium text-[11px] transition-colors"
              >
                <Zap className="w-3 h-3" />
                <span>Connect Gemini API</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Query Formulation Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-purple-500/30 shadow-cultural-lg space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Art Form scope selector */}
            <select
              value={selectedArtForm}
              onChange={(e) => setSelectedArtForm(e.target.value)}
              className="text-xs bg-slate-950 text-slate-200 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 sm:w-56"
            >
              <option value="">General Archive Search</option>
              {artForms.map((af) => (
                <option key={af.slug} value={af.slug}>
                  {af.name}
                </option>
              ))}
            </select>

            {/* Input field */}
            <div className="relative flex-1">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about sacred motifs, natural pigments, origins, or ceremonial contexts..."
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0 hover:scale-105"
            >
              {loading ? (
                <span>Retrieving...</span>
              ) : (
                <>
                  <span>Consult AI</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Curated Suggested Inquiries */}
        {suggestedInquiries.length > 0 && (
          <div className="pt-4 border-t border-slate-800">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-2.5">
              Suggested Archival Inquiries (Click to run):
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestedInquiries.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(sug)}
                  className="text-left text-xs px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-purple-200 transition-all flex items-center gap-1.5"
                >
                  <span className="text-amber-400 text-[10px] uppercase font-bold tracking-wider">
                    [{sug.topic}]
                  </span>
                  <span>{sug.question}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* AI Consultation Response Sheet */}
      {response && (
        <div className="space-y-8 animate-fade-in">
          {/* Main Answer Card */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-purple-500/40 shadow-cultural-lg space-y-6 relative overflow-hidden">
            {/* Top metadata row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <LayerBadge layer={response.information_layer} size="md" />
                <span className="text-xs font-mono text-purple-300/80 bg-purple-950/40 px-2.5 py-1 rounded border border-purple-500/20">
                  Model: {response.model_used}
                </span>
              </div>

              {response.context_art_form && (
                <span className="text-xs text-amber-300 font-serif font-medium bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/30">
                  Grounding Scope: {response.context_art_form}
                </span>
              )}
            </div>

            {/* Inquired Question */}
            <h2 className="font-serif text-2xl font-bold text-slate-100">
              "{response.question}"
            </h2>

            {/* Answer Content */}
            <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-sm space-y-4 whitespace-pre-wrap">
              {response.answer}
            </div>

            {/* Epistemic Integrity Disclaimer */}
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200/80 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>{response.disclaimer}</span>
            </div>
          </div>

          {/* Grounded Primary Archival Citations (Layer A) */}
          {response.sources_cited && response.sources_cited.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif text-lg font-bold text-slate-100">
                  Primary Archival Sources Cited (Layer A)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {response.sources_cited.map((citation, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-amber-200 leading-snug">
                        {citation.title}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                        {citation.citation_type || 'Monograph'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">
                      {citation.author && <span>{citation.author}</span>}
                      {citation.year && <span> ({citation.year})</span>}
                    </p>

                    {citation.archive_institution && (
                      <div className="text-[11px] text-amber-400/80 font-medium">
                        Institution: {citation.archive_institution}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grounded Artifacts Referenced */}
          {response.grounded_artifacts && response.grounded_artifacts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="font-serif text-lg font-bold text-slate-100">
                  Referenced Archival Artifacts
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {response.grounded_artifacts.map((art) => (
                  <Link
                    key={art.id}
                    to={`/artifacts/${art.id}`}
                    className="group block rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all p-3 space-y-2.5"
                  >
                    <div className="h-32 w-full overflow-hidden rounded-lg bg-slate-950 relative">
                      <img
                        src={art.image_url}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/80 text-amber-300">
                        {art.accession_number}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors line-clamp-1">
                        {art.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {art.art_form_name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gemini API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative animate-fade-in">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center">
                  <Key className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-100">
                    Connect Gemini API
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live Generative Intelligence Grounded in Sanskriti Archive
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                <p>
                  You can get a free, instantaneous Gemini API key directly from Google AI Studio:
                </p>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-semibold underline"
                >
                  <span>Google AI Studio Key Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <p className="text-[11px] text-slate-500">
                  Your key is saved locally in your browser's private storage and is never exposed or sent to third parties.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Google Gemini API Key:
                </label>
                <div className="relative">
                  <input
                    type={showKeyText ? 'text' : 'password'}
                    value={geminiKeyInput}
                    onChange={(e) => setGeminiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full pr-10 pl-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyText(!showKeyText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {testStatus === 'success' && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Connection verified! Google Gemini 2.0 Flash is ready.</span>
                </div>
              )}

              {testStatus === 'failed' && (
                <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/30">
                  <XCircle className="w-4 h-4" />
                  <span>Could not verify key. Please check key validity and quota.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              {isKeyConnected ? (
                <button
                  type="button"
                  onClick={handleDisconnectKey}
                  className="px-4 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 text-xs font-semibold transition-colors"
                >
                  Disconnect Key
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveGeminiKey}
                  disabled={testStatus === 'testing'}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  {testStatus === 'testing' ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Test & Save Connection</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
