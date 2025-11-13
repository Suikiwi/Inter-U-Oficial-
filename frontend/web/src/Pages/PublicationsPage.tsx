import React, { useState } from "react";
import PublicationFormModal from "../Components/Publications/PublicationFormModal";
import PublicationsFeed from "../Components/Publications/PublicationsFeed";
import { Layout } from "../Components/Layout";
import SidebarMenu from "../Components/Publications/SidebarMenu";

const PublicationsPage: React.FC = () => {
  const [openForm, setOpenForm] = useState(false);

  return (
    <Layout>
      <div className="flex">
        {/* Sidebar con Lucide Icons */}
        <SidebarMenu />

        {/* Contenido principal */}
        <main className="ml-24 flex-1 max-w-7xl mx-auto py-10 px-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-white">Feed global</h1>
            <button
              onClick={() => setOpenForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2"
              title="Crear publicación"
            >
              <span className="text-lg font-bold">+</span>
              Publicación nueva
            </button>
          </div>

          <PublicationsFeed />

          {openForm && (
            <PublicationFormModal
              onClose={() => setOpenForm(false)}
              onSaved={() => setOpenForm(false)}
            />
          )}
        </main>
      </div>
    </Layout>
  );
};

export default PublicationsPage;
