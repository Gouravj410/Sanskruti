import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Calendar,
  User,
  Tag,
  BookOpen,
  Sparkles,
  ArrowLeft,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { ArtifactDetail } from '../types';
import { LayerBadge } from '../components/common/LayerBadge';

export const ArtifactDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artifact, setArtifact] = useState<ArtifactDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadArtifact = async () => {
      setLoading(true);
      try {
        const data = await api.getArtifactById(parseInt(id, 10));
        setArtifact(data);
      } catch (err) {
        console.error('Failed to load artifact details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadArtifact();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="font-serif text-xl text-amber-300 animate-pulse">
          Retrieving Archival Record Sheet...
        </p>
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-2xl text-slate-100">Archival Record Not Found</h2>
        <p className="text-slate-400 mt-2">The record ID #{id} was not located in the registry.</p>
        <Link to="/explore?tab=artifacts" className="mt-4 inline-block text-amber-400 hover:underline">
          Return to Archival Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <div>
        <Link
          to="/explore?tab=artifacts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Archival Catalog</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: High-Resolution Archival Media Viewer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-cultural-lg group">
            <img
              src={artifact.image_url}
              alt={artifact.title}
              className="w-full h-auto max-h-[650px] object-contain mx-auto"
            />
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded bg-slate-950/85 backdrop-blur-md text-amber-300 border border-amber-500/30">
                {artifact.accession_number}
              </span>
              <LayerBadge layer={artifact.information_layer} size="sm" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>High-Fidelity Archival Capture</span>
            <span className="font-mono text-[11px] text-slate-500">ID: {artifact.accession_number}</span>
          </div>
        </div>

        {/* Right Column: Complete Archival Dossier Sheet */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LayerBadge layer={artifact.information_layer} size="md" showDescription />
            </div>

            {artifact.native_title && (
              <span className="font-serif text-lg text-amber-300/80 block mt-3">
                {artifact.native_title}
              </span>
            )}

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 mt-1 leading-snug">
              {artifact.title}
            </h1>

            {artifact.art_form_name && (
              <Link
                to={`/art-forms/${artifact.art_form_slug}`}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 uppercase tracking-widest"
              >
                <span>Part of {artifact.art_form_name} Tradition</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Key Archival Attributes Table */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-start justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">Accession Number:</span>
              <span className="font-mono font-bold text-amber-300">{artifact.accession_number}</span>
            </div>

            <div className="flex items-start justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">Artist / Guild:</span>
              <span className="font-medium text-slate-100 text-right">{artifact.artist_attribution}</span>
            </div>

            <div className="flex items-start justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">Period / Date:</span>
              <span className="text-slate-100">{artifact.period_estimated}</span>
            </div>

            <div className="flex items-start justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">Region of Origin:</span>
              <span className="text-slate-100">{artifact.region_origin}</span>
            </div>

            <div className="flex items-start justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">Medium & Surface:</span>
              <span className="text-slate-200 text-right max-w-[200px]">{artifact.medium}</span>
            </div>

            {artifact.dimensions && (
              <div className="flex items-start justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400 font-medium">Dimensions:</span>
                <span className="font-mono text-slate-100">{artifact.dimensions}</span>
              </div>
            )}
          </div>

          {/* Traditional Materials List */}
          {artifact.materials_used && artifact.materials_used.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-2">
                Documented Natural Materials:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {artifact.materials_used.map((mat, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-200"
                  >
                    🌿 {mat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-300">
              Archival Description
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {artifact.description}
            </p>
          </div>

          {/* Iconography Analysis */}
          {artifact.iconography_analysis && (
            <div className="space-y-2 p-4 rounded-xl bg-purple-950/20 border border-purple-500/20">
              <h4 className="text-xs uppercase font-bold tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Iconographical & Symbolic Analysis</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {artifact.iconography_analysis}
              </p>
            </div>
          )}

          {/* Verification Source & Provenance */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Institutional Verification Source</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              {artifact.verification_source}
            </p>
            {artifact.provenance && (
              <p className="text-slate-400 text-[11px] border-t border-emerald-500/20 pt-1 mt-1">
                <strong>Provenance:</strong> {artifact.provenance}
              </p>
            )}
          </div>

          {/* Ask AI Contextual Shortcut */}
          <div className="pt-2">
            <Link
              to={`/ask?question=${encodeURIComponent(`What is the cultural history and symbolism of the artifact '${artifact.title}' (${artifact.accession_number})?`)}&art_form=${artifact.art_form_slug || ''}`}
              className="w-full py-3 px-4 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Inquire with Sanskruti AI regarding this Artifact</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
