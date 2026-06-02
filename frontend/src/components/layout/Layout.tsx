import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import type { Page } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  return (
    <div className="min-h-screen bg-epi-bg flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
