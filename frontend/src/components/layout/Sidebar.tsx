export type Page = "resources";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { page: Page; label: string }[] = [
  { page: "resources", label: "Ressources" },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-48 shrink-0 border-r border-epi-border bg-epi-bg pt-5 px-3">
      <p className="text-[11px] font-bold text-white tracking-[0.2em] px-3 mb-3">
        OVERVIEW<span className="text-epi-accent">_</span>
      </p>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ page, label }) => (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors text-left ${
              currentPage === page
                ? "text-white bg-epi-surface"
                : "text-epi-muted hover:text-white hover:bg-epi-surface"
            }`}
          >
            <IconList className="w-4 h-4 shrink-0 text-epi-accent" />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function IconList({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M4 4h12v2H4V4zm0 5h12v2H4V9zm0 5h12v2H4v-2z" />
    </svg>
  );
}
