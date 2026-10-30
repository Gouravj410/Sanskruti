import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Layers,
  BookOpen,
  Sparkles,
  X,
  ChevronRight,
  Tag,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';
import { ArtFormSummary, ArtifactSummary, CanonicalMotifItem } from '../types';
import { ArtFormCard } from '../components/common/ArtFormCard';
import { ArtifactCard } from '../components/common/ArtifactCard';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const urlTab = (searchParams.get('tab') as 'all' | 'art-forms' | 'artifacts' | 'motifs') || 'all';

  const [activeTab, setActiveTab] = useState<'all' | 'art-forms' | 'artifacts' | 'motifs'>(urlTab);
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  const [prevUrlTab, setPrevUrlTab] = useState(urlTab);

  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchTerm(urlSearch);
  }
  if (urlTab !== prevUrlTab) {
    setPrevUrlTab(urlTab);
    setActiveTab(urlTab);
  }

  const [selectedLayer, setSelectedLayer] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [artForms, setArtForms] = useState<ArtFormSummary[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactSummary[]>([]);
  const [motifs, setMotifs] = useState<CanonicalMotifItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (searchTerm.trim().length >= 2) {
          const searchRes = await api.searchArchive(searchTerm.trim());
          if (!isMounted) return;
          setArtForms(searchRes.art_forms || []);
          setArtifacts(searchRes.artifacts || []);
          const normalizedMotifs: CanonicalMotifItem[] = (searchRes.motifs || []).map((m: any, idx: number) => ({
            id: m.motif?.id || `${m.art_form_slug}-${idx}`,
            name: m.motif?.name || m.name,
            symbolism: m.motif?.symbolism || m.symbolism,
            visual_cue: m.motif?.visual_cue || m.visual_cue,
            cultural_meaning: m.motif?.cultural_meaning || m.cultural_meaning || m.motif?.symbolism || m.symbolism,
            art_form_name: m.art_form_name,
            art_form_slug: m.art_form_slug,
            region: m.region || '',
            sources: m.sources,
          }));
          setMotifs(normalizedMotifs);
        } else {
          const [formsData, artifactsData, motifsData] = await Promise.all([
            api.getArtForms(),
            api.getArtifacts({ limit: 50 }),
            api.getCanonicalMotifs(),
          ]);
          if (!isMounted) return;
          setArtForms(formsData);
          setArtifacts(artifactsData);
          setMotifs(motifsData);
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Failed to query archive:', err);
        setError(err?.message || 'Failed to connect to the archival database. Please check your backend service or network connection.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [searchTerm, retryCount]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.trim()) {
      setSearchParams({ search: val, tab: activeTab });
    } else {
      setSearchParams({ tab: activeTab });
    }
  };

  const handleTabChange = (tab: 'all' | 'art-forms' | 'artifacts' | 'motifs') => {
    setActiveTab(tab);
    setSearchParams(searchTerm ? { search: searchTerm, tab } : { tab });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLayer('ALL');
    setSelectedRegion('ALL');
    setSelectedStatus('ALL');
    setSearchParams({ tab: activeTab });
  };

  // Filter logic
  const filteredArtForms = artForms.filter((af) => {
    if (selectedRegion !== 'ALL' && !af.region.toLowerCase().includes(selectedRegion.toLowerCase())) {
      return false;
    }
    if (selectedStatus !== 'ALL' && af.preservation_status !== selectedStatus) {
      return false;
    }
    return true;
  });

  const filteredArtifacts = artifacts.filter((art) => {
    if (selectedLayer !== 'ALL' && art.information_layer !== selectedLayer) {
      return false;
    }
    if (selectedRegion !== 'ALL' && !art.region_origin.toLowerCase().includes(selectedRegion.toLowerCase())) {
      return false;
    }
    return true;
  });

  const filteredMotifs = motifs.filter((m) => {
    if (selectedRegion !== 'ALL' && m.region && !m.region.toLowerCase().includes(selectedRegion.toLowerCase())) {
      return false;
    }
    return true;
  });

  const availableRegions = Array.from(
    new Set([
      ...artForms.map((a) => a.region),
      ...motifs.map((m) => m.region).filter(Boolean),
    ])
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
          Digital Archival Catalog
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 mt-1">
          Explore Traditions & Records
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-3xl">
          Search across primary folk & tribal art dossiers, individual cataloged artifacts with verified provenance, and canonical symbolic motifs.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-cultural space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-5 h-5 text-amber-400 absolute left-4 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by art form name, motif (e.g. Kohbar, Tarpa), pigment (e.g. Kajal, Cinnabar), region or accession..."
            className="w-full pl-12 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
          {/* Information Layer Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span>Layer:</span>
            </span>
            <button
              onClick={() => setSelectedLayer('ALL')}
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${
                selectedLayer === 'ALL'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              All Layers
            </button>
            <button
              onClick={() => setSelectedLayer('VERIFIED')}
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${
                selectedLayer === 'VERIFIED'
                  ? 'bg-emerald-900/60 text-emerald-300 border-emerald-400 font-bold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              Verified Archival
            </button>
            <button
              onClick={() => setSelectedLayer('COMMUNITY')}
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${
                selectedLayer === 'COMMUNITY'
                  ? 'bg-sky-900/60 text-sky-300 border-sky-400 font-bold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-sky-500/40'
              }`}
            >
              Practitioner Lore
            </button>
            <button
              onClick={() => setSelectedLayer('AI_INTERPRETATION')}
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${
                selectedLayer === 'AI_INTERPRETATION'
                  ? 'bg-purple-900/60 text-purple-300 border-purple-400 font-bold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-purple-500/40'
              }`}
            >
              AI Interpretation
            </button>
          </div>

          {/* Region and Clear */}
          <div className="flex items-center gap-3">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="text-xs bg-slate-950 text-slate-300 border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Regions</option>
              {availableRegions.map((r, idx) => (
                <option key={idx} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {(searchTerm || selectedLayer !== 'ALL' || selectedRegion !== 'ALL') && (
              <button
                onClick={clearFilters}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium underline underline-offset-4"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => handleTabChange('all')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'all'
              ? 'text-amber-400 border-amber-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Overview</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {filteredArtForms.length + filteredArtifacts.length + filteredMotifs.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('art-forms')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'art-forms'
              ? 'text-amber-400 border-amber-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Art Traditions</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {filteredArtForms.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('artifacts')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'artifacts'
              ? 'text-amber-400 border-amber-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Archival Records</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {filteredArtifacts.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('motifs')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'motifs'
              ? 'text-amber-400 border-amber-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Canonical Motifs</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {filteredMotifs.length}
          </span>
        </button>
      </div>

      {/* Error state with retry */}
      {error && (
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Archival Connection Error</p>
              <p className="text-xs text-rose-300/80 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={() => setRetryCount((c) => c + 1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition-all shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Results Rendering */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 animate-pulse space-y-3">
          <div className="w-8 h-8 mx-auto border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-serif text-lg">Querying Sanskruti Cultural Archive...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Active Tab: ALL or ART FORMS */}
          {(activeTab === 'all' || activeTab === 'art-forms') && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold text-slate-100">
                  Art Traditions ({filteredArtForms.length})
                </h2>
              </div>
              {filteredArtForms.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-sm">
                  No art traditions matched the filter criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredArtForms.map((af) => (
                    <ArtFormCard key={af.id} artForm={af} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active Tab: ALL or ARTIFACTS */}
          {(activeTab === 'all' || activeTab === 'artifacts') && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold text-slate-100">
                  Cataloged Archival Artifacts ({filteredArtifacts.length})
                </h2>
              </div>
              {filteredArtifacts.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-sm">
                  No archival artifacts matched the filter criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArtifacts.map((art) => (
                    <ArtifactCard key={art.id} artifact={art} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active Tab: ALL or MOTIFS (Fixed Motifs Tab) */}
          {(activeTab === 'all' || activeTab === 'motifs') && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-100 flex items-center gap-2">
                    <span>Canonical Motifs & Sacred Iconography</span>
                    <span className="text-sm font-sans font-normal text-slate-400">({filteredMotifs.length})</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Primary symbolic archetypes, sacred geometry, and visual metaphors preserved across living traditions.
                  </p>
                </div>
              </div>

              {filteredMotifs.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-sm">
                  No canonical motifs matched the filter criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMotifs.map((motif, idx) => (
                    <div
                      key={motif.id || idx}
                      className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between shadow-cultural space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-serif text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                                {motif.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Link
                                  to={`/art-forms/${motif.art_form_slug}`}
                                  className="text-xs font-medium text-amber-400/90 hover:text-amber-300 hover:underline"
                                >
                                  {motif.art_form_name}
                                </Link>
                                {motif.region && (
                                  <span className="text-[11px] text-slate-500">
                                    • {motif.region}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Symbolism */}
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/80 block">
                            Symbolism & Sacred Meaning
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {motif.symbolism}
                          </p>
                        </div>

                        {/* Visual Cue */}
                        {motif.visual_cue && (
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                              Visual Archetype Cue
                            </span>
                            <p className="text-xs text-slate-400 italic">
                              "{motif.visual_cue}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Footer link to Tradition */}
                      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          Layer A • Verified Archival
                        </span>
                        <Link
                          to={`/art-forms/${motif.art_form_slug}`}
                          className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                        >
                          <span>View Tradition</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
