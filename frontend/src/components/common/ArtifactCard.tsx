import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, Sparkles, User, Calendar, ExternalLink } from 'lucide-react';
import { ArtifactSummary } from '../../types';
import { LayerBadge } from './LayerBadge';

interface ArtifactCardProps {
  artifact: ArtifactSummary;
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifact }) => {
  return (
    <div className="group relative rounded-2xl overflow-hidden bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 shadow-cultural hover:shadow-cultural-lg transition-all duration-300 flex flex-col">
      {/* Image Preview Container */}
      <div className="relative h-60 w-full overflow-hidden bg-slate-950">
        <img
          src={artifact.image_url}
          alt={artifact.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Accession Number & Layer Badge */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30">
            {artifact.accession_number}
          </span>
          <LayerBadge layer={artifact.information_layer} size="sm" />
        </div>

        {/* Native Title on Image */}
        {artifact.native_title && (
          <div className="absolute bottom-3 left-4">
            <span className="text-xs font-serif text-amber-200/90 px-2 py-0.5 rounded bg-slate-950/70 backdrop-blur-sm border border-amber-500/20">
              {artifact.native_title}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Associated Art Form */}
          {artifact.art_form_name && (
            <Link
              to={`/art-forms/${artifact.art_form_slug}`}
              className="text-[11px] font-medium text-amber-400 hover:text-amber-300 tracking-wider uppercase inline-block mb-1"
            >
              {artifact.art_form_name}
            </Link>
          )}

          <h3 className="font-serif text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-2">
            {artifact.title}
          </h3>

          <div className="mt-2.5 space-y-1 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{artifact.artist_attribution}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{artifact.period_estimated}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 italic">
            {artifact.medium}
          </p>

          {/* Tags */}
          {artifact.tags && artifact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {artifact.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action link */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
            {artifact.region_origin}
          </span>

          <Link
            to={`/artifacts/${artifact.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>Archival Sheet</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
