import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, BookOpen, Layers } from 'lucide-react';
import { ArtFormSummary } from '../../types';
import { PreservationBadge } from './PreservationBadge';

interface ArtFormCardProps {
  artForm: ArtFormSummary;
}

export const ArtFormCard: React.FC<ArtFormCardProps> = ({ artForm }) => {
  return (
    <div className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-amber-500/40 shadow-cultural hover:shadow-cultural-lg transition-all duration-300 flex flex-col">
      {/* Cover Image Container */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-950">
        <img
          src={artForm.cover_image_url}
          alt={artForm.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        {/* Status & Category Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30">
            {artForm.category}
          </span>
          <PreservationBadge status={artForm.preservation_status} />
        </div>

        {/* Native Name on Image */}
        {artForm.native_name && (
          <div className="absolute bottom-3 left-4">
            <span className="text-sm font-serif text-amber-200/90 font-medium px-2.5 py-0.5 rounded bg-slate-950/70 backdrop-blur-sm border border-amber-500/20">
              {artForm.native_name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-xl font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
            {artForm.name}
          </h3>

          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{artForm.region}</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{artForm.period_origin}</span>
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mt-3 line-clamp-3">
            {artForm.summary}
          </p>
        </div>

        {/* Footer info & CTA */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>{artForm.artifact_count || 0} Archival Artifacts</span>
          </span>

          <Link
            to={`/art-forms/${artForm.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors group-hover:translate-x-0.5"
          >
            <span>Dossier</span>
            <BookOpen className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
