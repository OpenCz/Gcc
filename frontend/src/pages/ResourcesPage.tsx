import { useState } from "react";
import { SubjectCard, type Subject } from "../components/ui/SubjectCard";
import { SubjectDetail } from "../components/ui/SubjectDetail";

const MOCK_SUBJECTS: Subject[] = [
  {
    id: 1,
    title: "Workshop C",
    tag: "C",
    level: "Débutant",
    fileCount: 1,
    description:
      "Workshop d'introduction au langage C. Découvrez les bases de la programmation en C : variables, conditions, boucles, fonctions et pointeurs.",
    resources: [{ name: "WorkshopC.pdf", url: "#" }],
  },
  {
    id: 2,
    title: "Workshop C++",
    tag: "C++",
    level: "Intermédiaire",
    fileCount: 1,
    description:
      "Workshop d'introduction au C++. Apprenez les concepts objets : classes, héritage, polymorphisme et la STL.",
    resources: [{ name: "WorkshopCpp.pdf", url: "#" }],
  },
];

const FILTERS = ["Tous", "Débutant", "Intermédiaire", "Avancé", "Favoris"] as const;

export function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("Tous");
  const [viewGrid, setViewGrid] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const filtered = MOCK_SUBJECTS.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = s.title.toLowerCase().includes(q) || s.tag.toLowerCase().includes(q);
    const matchFilter = activeFilter === "Tous" || activeFilter === "Favoris" || s.level === activeFilter;
    return matchSearch && matchFilter;
  });

  const totalFiles = MOCK_SUBJECTS.reduce((acc, s) => acc + s.fileCount, 0);

  return (
    <div className="p-6">
      {/* Hero banner */}
      <div className="bg-epi-surface border border-epi-border border-l-4 border-l-epi-accent rounded-lg p-5 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-lg font-bold text-white mb-1">CODING CLUB</h1>
          <p className="text-sm text-epi-muted">
            Bienvenue au Coding Club ! Retrouvez ici les ressources et sujets de la session.
          </p>
        </div>
        <div className="text-right text-xs text-epi-muted space-y-1 shrink-0 ml-6">
          <p className="flex items-center justify-end gap-1.5">
            <IconCalendar className="w-3.5 h-3.5 text-epi-accent" />
            Samedi 8 Mars 2026
          </p>
          <p className="flex items-center justify-end gap-1.5">
            <IconPin className="w-3.5 h-3.5 text-epi-accent" />
            Epitech — Le Hub
          </p>
          <p className="flex items-center justify-end gap-3 text-epi-ghost">
            <span className="flex items-center gap-1">
              <IconList className="w-3 h-3" />
              {filtered.length} sujets
            </span>
            <span className="flex items-center gap-1">
              <IconFile className="w-3 h-3" />
              {totalFiles} fichiers
            </span>
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-epi-ghost" />
        <input
          type="text"
          placeholder="Rechercher un sujet ou un tag..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-epi-surface border border-epi-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-epi-ghost outline-none focus:border-epi-accent transition-colors"
        />
      </div>

      {/* Filters + view controls */}
      <div className="flex items-center justify-between mb-5 gap-4">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                activeFilter === f
                  ? "bg-epi-accent border-epi-accent text-white"
                  : "border-epi-border text-epi-muted hover:border-epi-accent hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-epi-muted border border-epi-border rounded-lg hover:border-epi-border-hover transition-colors">
            <IconSort className="w-3.5 h-3.5" />
            Par défaut
            <IconChevron className="w-3 h-3" />
          </button>
          <div className="flex border border-epi-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewGrid(true)}
              className={`px-2.5 py-1.5 transition-colors ${viewGrid ? "bg-epi-accent text-white" : "text-epi-ghost hover:bg-epi-surface"}`}
            >
              <IconGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewGrid(false)}
              className={`px-2.5 py-1.5 transition-colors ${!viewGrid ? "bg-epi-accent text-white" : "text-epi-ghost hover:bg-epi-surface"}`}
            >
              <IconRows className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className={viewGrid ? "grid grid-cols-2 gap-4" : "flex flex-col gap-3"}>
        {filtered.map(subject => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            onClick={() => setSelectedSubject(subject)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-epi-ghost text-sm">
          Aucun sujet trouvé
        </div>
      )}

      {selectedSubject && (
        <SubjectDetail
          subject={selectedSubject}
          onClose={() => setSelectedSubject(null)}
        />
      )}
    </div>
  );
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  );
}

function IconPin({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
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

function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function IconSort({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
    </svg>
  );
}

function IconChevron({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

function IconGrid({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function IconRows({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  );
}
