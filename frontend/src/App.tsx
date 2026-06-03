import { useState } from "react";
import { Layout } from "./components/layout/Layout";
import { ResourcesPage } from "./pages/ResourcesPage";
import { AdminPage } from "./pages/AdminPage";
import { MantaPage } from "./pages/MantaPage";
import type { Page } from "./components/layout/Sidebar";
import "./index.css";

export function App() {
  if (window.location.pathname.startsWith("/admin")) return <AdminPage />;
  if (window.location.pathname.startsWith("/manta")) return <MantaPage />;

  const [currentPage, setCurrentPage] = useState<Page>("resources");

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === "resources" && <ResourcesPage />}
    </Layout>
  );
}

export default App;
