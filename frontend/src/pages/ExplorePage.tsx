import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Layers, BookOpen, Sparkles, X, ChevronRight, MapPin, Tag } from 'lucide-react';
import { api } from '../services/api';
import { ArtFormSummary, ArtifactSummary, InformationLayer } from '../types';
import { ArtFormCard } from '../components/common/ArtFormCard';
import { ArtifactCard } from '../components/common/ArtifactCard';
import { LayerBadge } from '../components/common/LayerBadge';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialTab = (searchParams.get('tab') as 'all' | 'art-forms' | 'artifacts' | 'motifs') || 'all';

  const [activeTab, setActiveTab] = useState<'all' | 'art-forms' | 'artifacts' | 'motifs'>(initialTab);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedLayer, setSelectedLayer] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [artForms, setArtForms] = useState<ArtFormSummary[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactSummary[]>([]);
  const [motifs, setMotifs] = useState<Array<{ motif: any; art_form_slug: string; art_form_name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Sync state if URL search param changes
  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearchTerm(q);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['all', 'art-forms', 'artifacts', 'motifs'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (searchTerm.trim().length >= 2) {
          const searchRes = await api.searchArchive(searchTerm.trim());
          setArtForms(searchRes.art_forms);
          setArtifacts(searchRes.artifacts);
          setMotifs(searchRes.motifs);
        } else {
          const [formsData, artifactsData] = await Promise.all([
            api.getArtForms(),
            api.getArtifacts({ limit: 50 }),
          ]);
          setArtForms(formsData);
          setArtifacts(artifactsData);
          
          // Flatten motifs from formsData
          const collectedMotifs: any[] = [];
          for (const af of formsData) {
            // Fetch detail for motifs if needed, or if summary doesn't have it, load
          }
        }
      } catch (err) {
        console.error('Failed to query archive:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm]);

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

  const availableRegions = Array.from(new Set(artForms.map((a) => a.region)));

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
      <div className="flex border-b border-slate-800 space-x-6 text-sm font-semibold">
        <button
          onClick={() => handleTabChange('all')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'all'
              ? 'text-amber-400 border-amber-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Overview</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {filteredArtForms.length + filteredArtifacts.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('art-forms')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
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
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
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
      </div>

      {/* Results Rendering */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 animate-pulse">
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
        </div>
      )}
    </div>
  );
};
