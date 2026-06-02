import { useState } from "react";
import { Layout } from "./components/layout/Layout";
import { ResourcesPage } from "./pages/ResourcesPage";
import type { Page } from "./components/layout/Sidebar";
import "./index.css";

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>("resources");

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === "resources" && <ResourcesPage />}
    </Layout>
  );
}

export default App;
