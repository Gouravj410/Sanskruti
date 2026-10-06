import React, { useEffect, useState } from 'react';
import { Users, ShieldCheck, HeartHandshake, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { api } from '../services/api';
import { ArtFormSummary, PractitionerEntry } from '../types';
import { LayerBadge } from '../components/common/LayerBadge';

export const ContributePage: React.FC = () => {
  const [artForms, setArtForms] = useState<ArtFormSummary[]>([]);
  const [practitionerEntries, setPractitionerEntries] = useState<PractitionerEntry[]>([]);
  
  // Form State
  const [artFormId, setArtFormId] = useState<number | ''>('');
  const [contributorName, setContributorName] = useState('');
  const [roleOrTitle, setRoleOrTitle] = useState('');
  const [communityAffiliation, setCommunityAffiliation] = useState('');
  const [location, setLocation] = useState('');
  const [lineageTradition, setLineageTradition] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [forms, entries] = await Promise.all([
          api.getArtForms(),
          api.getPractitioners(),
        ]);
        setArtForms(forms);
        if (forms.length > 0) setArtFormId(forms[0].id);
        setPractitionerEntries(entries);
      } catch (err) {
        console.error('Failed to load contribute metadata:', err);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artFormId || !contributorName || !title || !content) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const created = await api.submitPractitionerEntry({
        art_form_id: Number(artFormId),
        contributor_name: contributorName,
        role_or_title: roleOrTitle || 'Practitioner',
        community_affiliation: communityAffiliation || 'Traditional Community',
        location: location || 'India',
        lineage_tradition: lineageTradition || undefined,
        title,
        content,
        media_url: mediaUrl || undefined,
      });

      setSuccessMessage(`Contribution '${created.title}' recorded under Layer B (Practitioner Knowledge) for archival review.`);
      // Reset form
      setTitle('');
      setContent('');
      setMediaUrl('');
      // Reload list
      const updatedEntries = await api.getPractitioners();
      setPractitionerEntries(updatedEntries);
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/60 border border-sky-500/30 text-sky-300 text-xs font-semibold">
          <Users className="w-3.5 h-3.5 text-sky-400" />
          <span>Layer B • Community & Practitioner Knowledge Desk</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-100">
          Practitioner Contribution Portal
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed">
          Traditional art does not live solely in museum glass cases—it lives in the hands, songs, and memory of hereditary artisan lineages. Contribute oral lore, pigment recipes, or ceremonial practices to be preserved in the archive.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Form Column */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-3xl bg-slate-900 border border-sky-500/30 shadow-cultural space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-slate-100">
                Submit Cultural Knowledge
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Your entry will be tagged under <strong>Layer B (Practitioner Knowledge)</strong> and vetted by the archival review board.
              </p>
            </div>

            {successMessage && (
              <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Associated Art Form *
                </label>
                <select
                  value={artFormId}
                  onChange={(e) => setArtFormId(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-sky-400"
                  required
                >
                  {artForms.map((af) => (
                    <option key={af.id} value={af.id}>
                      {af.name} ({af.region})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Practitioner / Contributor Name *
                  </label>
                  <input
                    type="text"
                    value={contributorName}
                    onChange={(e) => setContributorName(e.target.value)}
                    placeholder="e.g. Master J. Niranjan"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-sky-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Role / Lineage Status *
                  </label>
                  <input
                    type="text"
                    value={roleOrTitle}
                    onChange={(e) => setRoleOrTitle(e.target.value)}
                    placeholder="e.g. 5th Generation Chitrakara Master"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-sky-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Community / Guild Affiliation
                  </label>
                  <input
                    type="text"
                    value={communityAffiliation}
                    onChange={(e) => setCommunityAffiliation(e.target.value)}
                    placeholder="e.g. Raghurajpur Chitrakara Sahi"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Geographic Location (Village / State)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Dindori, Madhya Pradesh"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Hereditary Lineage / Tradition (Optional)
                </label>
                <input
                  type="text"
                  value={lineageTradition}
                  onChange={(e) => setLineageTradition(e.target.value)}
                  placeholder="e.g. Guru-Shishya tradition of Shahpura Joshi clan"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Oral Lore Title / Topic *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Sacred Reason We Ferment Iron in Jaggery Water"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-sky-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Narrative Knowledge / Oral Lore / Recipe Nuance *
                </label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe the generational oral lore, sacred ceremony rules, pigment preparation secrets, or ancestral methods..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-sky-400 leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Reference Media URL (Photo/Audio recording link)
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-sky-400"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                {submitting ? (
                  <span>Recording in Archive...</span>
                ) : (
                  <>
                    <span>Submit to Practitioner Archive Desk</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Existing Living Contributions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-sky-400" />
              <span>Living Knowledge Preservation</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Practitioner knowledge submitted here provides crucial context that academic textbooks often overlook. It gives voice directly to the culture bearers.
            </p>
          </div>

          <div className="space-y-4">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-300 block">
              Recently Preserved Practitioner Entries:
            </span>

            {practitionerEntries.map((pe) => (
              <div
                key={pe.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sky-300 text-sm">
                    {pe.contributor_name}
                  </span>
                  <LayerBadge layer={pe.information_layer} size="sm" />
                </div>
                <div className="text-[11px] text-slate-400">
                  {pe.role_or_title} • {pe.location}
                </div>
                <h4 className="font-serif text-amber-200 font-semibold pt-1">
                  "{pe.title}"
                </h4>
                <p className="text-slate-300 line-clamp-3 italic">
                  "{pe.content}"
                </p>
                {pe.art_form_name && (
                  <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 uppercase tracking-wider">
                    Preserved under {pe.art_form_name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
