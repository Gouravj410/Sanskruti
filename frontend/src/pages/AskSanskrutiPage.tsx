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
  const [suggestedInquiries, setSuggestedInquiries] = useState<Array<{ art_form_slug: string; question: string; topic: string }>>([]);
  
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AskSanskrutiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
          Consult artificial intelligence strictly bound to cultural truth. Every response is synthesized by analyzing verified monographs, museum registers, and practitioner records—clearly cited below.
        </p>
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
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs text-center">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-slate-200 text-base">
            Consulting Digital Archive & Synthesizing Cultural Context...
          </p>
          <p className="text-xs text-slate-500">
            Retrieving verified monographs, canonical motifs, and museum records.
          </p>
        </div>
      )}

      {/* Structured AI Response Display */}
      {response && !loading && (
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-purple-500/40 shadow-cultural-lg space-y-8 animate-in fade-in duration-300">
          
          {/* Top metadata bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <LayerBadge layer={response.information_layer} size="md" />
              <span className="text-xs font-mono text-slate-400">
                Engine: {response.model_used}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
              <span>Grounded in Digital Archive</span>
            </div>
          </div>

          {/* User question */}
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Inquiry Context:
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-200">
              "{response.question}"
            </h2>
          </div>

          {/* Formatted Answer Body */}
          <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans space-y-4 border-l-2 border-purple-500/40 pl-5 py-1">
            {response.answer}
          </div>

          {/* Grounded Academic Citations */}
          {response.sources_cited && response.sources_cited.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <BookOpen className="w-4 h-4" />
                <span>Verified Archival Sources Cited in this Synthesis:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {response.sources_cited.map((src, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="font-bold text-slate-200 block">{src.title}</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">
                      {src.author || 'Archival Board'} ({src.year || 'Historic'}) • {src.archive_institution || 'Archive'}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium inline-block mt-1">
                      ✓ Primary Source
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grounded Artifacts References */}
          {response.grounded_artifacts && response.grounded_artifacts.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-300 block">
                Archival Records Consulted:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {response.grounded_artifacts.map((ref) => (
                  <Link
                    key={ref.id}
                    to={`/artifacts/${ref.id}`}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 flex items-center gap-3 group transition-all"
                  >
                    <img
                      src={ref.image_url}
                      alt={ref.title}
                      className="w-12 h-12 object-cover rounded-lg shrink-0"
                    />
                    <div className="overflow-hidden">
                      <span className="font-mono text-[10px] text-amber-400 block">
                        {ref.accession_number}
                      </span>
                      <span className="text-xs font-medium text-slate-200 group-hover:text-amber-300 truncate block">
                        {ref.title}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Mandatory Epistemic Disclaimer */}
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 italic leading-relaxed">
            {response.disclaimer}
          </div>

        </div>
      )}
    </div>
  );
};
