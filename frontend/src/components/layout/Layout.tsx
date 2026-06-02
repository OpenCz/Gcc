import type { ReactNode } from "react";
import { AppShell } from "@mantine/core";
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
    <AppShell
      header={{ height: 48 }}
      navbar={{ width: 192, breakpoint: "sm" }}
      padding={0}
    >
      <AppShell.Header style={{ border: "none" }}>
        <Navbar />
      </AppShell.Header>

      <AppShell.Navbar style={{ border: "none", background: "var(--epi-bg)" }}>
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      </AppShell.Navbar>

      <AppShell.Main style={{ background: "var(--epi-bg)" }}>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
