import React from 'react';
import { ShieldCheck, Users, Sparkles, Wand2 } from 'lucide-react';
import { InformationLayer } from '../../types';

interface LayerBadgeProps {
  layer: InformationLayer | string;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

export const LayerBadge: React.FC<LayerBadgeProps> = ({ layer, size = 'md', showDescription = false }) => {
  const layerConfigs: Record<
    string,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode; desc: string }
  > = {
    VERIFIED: {
      label: 'Verified Archival Record',
      bg: 'bg-emerald-950/70',
      text: 'text-emerald-300',
      border: 'border-emerald-500/40',
      icon: <ShieldCheck className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />,
      desc: 'Sourced from academic monographs, museum registries, and peer-documented field records.',
    },
    COMMUNITY: {
      label: 'Practitioner Knowledge',
      bg: 'bg-sky-950/70',
      text: 'text-sky-300',
      border: 'border-sky-500/40',
      icon: <Users className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />,
      desc: 'Contributed directly by hereditary artisan lineages and community culture bearers.',
    },
    AI_INTERPRETATION: {
      label: 'AI Cultural Interpretation',
      bg: 'bg-purple-950/70',
      text: 'text-purple-300',
      border: 'border-purple-500/40',
      icon: <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />,
      desc: 'Synthesized by AI intelligence using verified archival context and citations.',
    },
    AI_GENERATED: {
      label: 'AI Creative Synthesis',
      bg: 'bg-amber-950/70',
      text: 'text-amber-300',
      border: 'border-amber-500/40',
      icon: <Wand2 className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />,
      desc: 'Synthetic algorithmic generation exploring traditional aesthetic geometries.',
    },
  };

  const config = layerConfigs[layer] || layerConfigs.VERIFIED;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  };

  return (
    <div className="inline-flex flex-col">
      <span
        title={config.desc}
        className={`inline-flex items-center rounded-full border backdrop-blur-sm ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} transition-all hover:scale-105`}
      >
        {config.icon}
        <span>{config.label}</span>
      </span>
      {showDescription && (
        <span className="text-[11px] text-slate-400 mt-1 italic pl-1">{config.desc}</span>
      )}
    </div>
  );
};
