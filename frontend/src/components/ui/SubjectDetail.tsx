import { Badge } from "./Badge";
import type { Subject } from "./SubjectCard";

interface SubjectDetailProps {
  subject: Subject;
  onClose: () => void;
}

export function SubjectDetail({ subject, onClose }: SubjectDetailProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 w-80 bg-epi-surface border-l border-epi-border flex flex-col z-50">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-epi-border">
          <div className="flex items-center gap-2">
            <IconList className="text-epi-accent w-4 h-4 shrink-0" />
            <h2 className="font-bold text-white text-sm">{subject.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 text-xs text-epi-muted hover:text-white transition-colors">
              <IconLink className="w-3 h-3" />
              Lien
            </button>
            <button
              onClick={onClose}
              className="text-epi-muted hover:text-white transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <p className="text-sm text-epi-muted leading-relaxed">{subject.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-xs bg-epi-surface-2 text-epi-muted px-2 py-1 rounded font-mono">
              {subject.tag}
            </span>
            <Badge level={subject.level} />
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
              <IconDownload className="w-4 h-4 text-epi-accent" />
              Ressources
            </h3>
            <div className="space-y-2">
              {subject.resources.map((r, i) => (
                <div key={i} className="flex items-center gap-2 bg-epi-surface-2 rounded-lg p-3">
                  <IconFile className="w-4 h-4 text-epi-accent shrink-0" />
                  <span className="text-xs text-epi-muted flex-1 truncate">{r.name}</span>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs border border-epi-accent text-epi-accent rounded hover:bg-epi-accent hover:text-white transition-colors shrink-0"
                  >
                    <IconEye className="w-3 h-3" />
                    Voir
                  </a>
                  <a
                    href={r.url}
                    download
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-epi-accent text-white rounded hover:bg-epi-accent-dark transition-colors shrink-0"
                  >
                    <IconDownload className="w-3 h-3" />
                    Télécharger
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function IconList({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M4 4h12v2H4V4zm0 5h12v2H4V9zm0 5h12v2H4v-2z" />
    </svg>
  );
}

function IconLink({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function IconFile({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
    </svg>
  );
}

function IconEye({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function IconDownload({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}
