import { Badge } from "./Badge";
import type { Level } from "./Badge";

export interface Subject {
  id: number;
  title: string;
  tag: string;
  level: Level;
  fileCount: number;
  description: string;
  resources: { name: string; url: string }[];
}

interface SubjectCardProps {
  subject: Subject;
  onClick: () => void;
}

export function SubjectCard({ subject, onClick }: SubjectCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-epi-surface border border-epi-border rounded-lg p-4 cursor-pointer hover:border-epi-border-hover transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <IconList className="text-epi-accent w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-semibold text-white text-sm">{subject.title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge level={subject.level} />
          <button
            onClick={e => e.stopPropagation()}
            className="text-epi-ghost hover:text-epi-warning transition-colors"
          >
            ☆
          </button>
        </div>
      </div>

      <p className="text-epi-accent text-xs mb-4">{subject.tag}</p>

      <div className="flex items-center justify-between text-xs text-epi-faint">
        <span className="flex items-center gap-1">
          <IconFile className="w-3 h-3" />
          {subject.fileCount} fichier{subject.fileCount > 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1 text-epi-ghost">
          <IconInfo className="w-3 h-3" />
          Cliquer pour voir les détails
        </span>
      </div>
    </div>
  );
}

function IconList({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M4 4h12v2H4V4zm0 5h12v2H4V9zm0 5h12v2H4v-2z" />
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

function IconInfo({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  );
}
