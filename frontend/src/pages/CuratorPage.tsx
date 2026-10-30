import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  FileCheck,
  Archive,
  Lock,
  KeyRound,
  RefreshCw,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { PractitionerEntry, VerificationStatus } from '../types';
import { LayerBadge } from '../components/common/LayerBadge';

export const CuratorPage: React.FC = () => {
  const [curatorKey, setCuratorKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Submissions state
  const [submissions, setSubmissions] = useState<PractitionerEntry[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING_REVIEW');
  const [reviewerName, setReviewerName] = useState('Archival Curator');
  const [notesState, setNotesState] = useState<Record<number, string>>({});
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curatorKey.trim()) {
      setAuthError('Please enter the curator access key.');
      return;
    }

    setVerifying(true);
    setAuthError(null);
    try {
      const isValid = await api.verifyCuratorKey(curatorKey.trim());
      if (isValid) {
        setIsAuthenticated(true);
        loadSubmissions(curatorKey.trim(), filterStatus);
      } else {
        setAuthError('Invalid curator access key. Verification rejected by backend.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication request failed. Backend may be unreachable.');
    } finally {
      setVerifying(false);
    }
  };

  const loadSubmissions = async (key: string, status: string) => {
    setLoadingSubmissions(true);
    setActionError(null);
    try {
      const data = await api.getCuratorSubmissions(key, status);
      setSubmissions(data);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to fetch curator submissions.');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleFilterChange = (newStatus: string) => {
    setFilterStatus(newStatus);
    if (isAuthenticated) {
      loadSubmissions(curatorKey.trim(), newStatus);
    }
  };

  const handleReviewAction = async (entryId: number, newStatus: VerificationStatus) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const notes = notesState[entryId] || '';
      await api.reviewSubmission(curatorKey.trim(), entryId, {
        status: newStatus,
        curator_notes: notes,
        reviewed_by: reviewerName,
      });

      setActionSuccess(`Submission #${entryId} updated to ${newStatus}.`);
      // Reload current filter list
      await loadSubmissions(curatorKey.trim(), filterStatus);
    } catch (err: any) {
      setActionError(err?.message || `Failed to transition submission #${entryId} to ${newStatus}.`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-500/40">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-950/70 text-sky-300 border border-sky-500/40">
            <CheckCircle className="w-3 h-3" />
            <span>Approved (Unpublished)</span>
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">
            <FileCheck className="w-3 h-3" />
            <span>Published in Archive</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/70 text-rose-300 border border-rose-500/40">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <Archive className="w-3 h-3" />
            <span>Archived / Withdrawn</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 space-y-8 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-cultural">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-100">
            Curator Editorial Desk
          </h1>
          <p className="text-xs text-slate-400">
            Authorized archival review boundary. Public submissions must be verified by accredited curators before inclusion in the public archive.
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-cultural">
          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Curator Access Key (CURATOR_API_KEY)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={curatorKey}
                onChange={(e) => setCuratorKey(e.target.value)}
                placeholder="Enter server-configured curator key..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Configured via backend environment variable <code className="text-amber-400/80">CURATOR_API_KEY</code>. Never stored in browser localStorage.
            </p>
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
          >
            {verifying ? (
              <span>Verifying Authorization...</span>
            ) : (
              <>
                <span>Access Curator Desk</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
            Archival Governance & Editorial Desk
          </span>
          <h1 className="font-serif text-3xl font-bold text-slate-100 mt-1">
            Community Knowledge Review
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Inspect, verify provenance, approve, or publish submitted practitioner entries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Signed in as</span>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="text-xs font-semibold text-amber-300 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-400 text-right w-40"
              placeholder="Curator Name"
            />
          </div>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setCuratorKey('');
              setSubmissions([]);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 text-xs font-medium transition-colors"
          >
            Lock Desk
          </button>
        </div>
      </div>

      {/* Action feedback */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex border-b border-slate-800 space-x-2 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'PENDING_REVIEW', label: 'Pending Review' },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'PUBLISHED', label: 'Published' },
            { id: 'REJECTED', label: 'Rejected' },
            { id: 'ARCHIVED', label: 'Archived' },
            { id: 'ALL', label: 'All Submissions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleFilterChange(tab.id)}
              className={`pb-2.5 px-3 border-b-2 transition-all shrink-0 ${
                filterStatus === tab.id
                  ? 'text-amber-400 border-amber-400'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => loadSubmissions(curatorKey.trim(), filterStatus)}
          disabled={loadingSubmissions}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-300 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingSubmissions ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Submissions list */}
      {loadingSubmissions ? (
        <div className="py-20 text-center text-slate-400 animate-pulse space-y-2">
          <div className="w-8 h-8 mx-auto border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-serif text-sm">Loading submissions...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-sm space-y-2">
          <FileCheck className="w-10 h-10 mx-auto text-slate-600" />
          <p className="font-semibold text-slate-300">No submissions found under status "{filterStatus}".</p>
          <p className="text-xs text-slate-500">Submissions from the public contribution portal will appear here for editorial verification.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-6 shadow-cultural"
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      ID #{sub.id}
                    </span>
                    {getStatusBadge(sub.verification_status)}
                    <LayerBadge layer={sub.information_layer} size="sm" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-slate-100">
                    "{sub.title}"
                  </h3>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sky-300">{sub.contributor_name}</span>
                    <span>• {sub.role_or_title}</span>
                    {sub.community_affiliation && <span>• {sub.community_affiliation}</span>}
                    {sub.location && <span>• {sub.location}</span>}
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <span>Target Art Form:</span>
                  <p className="font-semibold text-amber-300">
                    {sub.art_form_name || `ID #${sub.art_form_id}`}
                  </p>
                  <p className="text-[11px] mt-0.5">{new Date(sub.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-3">
                {sub.lineage_tradition && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <span className="text-amber-400/90 font-bold uppercase tracking-wider text-[10px] block">
                      Hereditary Lineage Tradition:
                    </span>
                    <span className="text-slate-300">{sub.lineage_tradition}</span>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {sub.content}
                </div>

                {sub.media_url && (
                  <div className="text-xs">
                    <span className="text-slate-400">Media Reference: </span>
                    <a
                      href={sub.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline"
                    >
                      {sub.media_url}
                    </a>
                  </div>
                )}

                {/* Previous Curator Review Info */}
                {sub.curator_notes && (
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-purple-400 block">
                      Curator Review History ({sub.reviewed_by || 'Curator'}):
                    </span>
                    <p className="mt-0.5">{sub.curator_notes}</p>
                  </div>
                )}
              </div>

              {/* Review Action Controls */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 block">
                    Curator Reviewer Notes / Justification:
                  </label>
                  <input
                    type="text"
                    value={notesState[sub.id] || ''}
                    onChange={(e) => setNotesState({ ...notesState, [sub.id]: e.target.value })}
                    placeholder="Document source vetting, oral authenticity notes, or rejection reasoning..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5">
                  {sub.verification_status !== 'APPROVED' && (
                    <button
                      onClick={() => handleReviewAction(sub.id, 'APPROVED')}
                      className="px-4 py-2 rounded-xl bg-sky-600/80 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve Entry</span>
                    </button>
                  )}

                  {sub.verification_status !== 'PUBLISHED' && (
                    <button
                      onClick={() => handleReviewAction(sub.id, 'PUBLISHED')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all flex items-center gap-1.5"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Publish to Public Archive</span>
                    </button>
                  )}

                  {sub.verification_status !== 'REJECTED' && (
                    <button
                      onClick={() => handleReviewAction(sub.id, 'REJECTED')}
                      className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

                  {sub.verification_status !== 'ARCHIVED' && (
                    <button
                      onClick={() => handleReviewAction(sub.id, 'ARCHIVED')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all flex items-center gap-1.5"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
