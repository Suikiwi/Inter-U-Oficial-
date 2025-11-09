import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicationsFeed from "../Components/Publications/PublicationsFeed";
import PublicationFormModal from "../Components/Publications/PublicationFormModal";
import { Layout } from "../Components/Layout";

const PublicationsPage: React.FC = () => {
  const [openForm, setOpenForm] = useState<{ open: boolean; editId?: number }>({ open: false });
  const navigate = useNavigate();
  const token = !!localStorage.getItem("accessToken");

  const handleNewPublication = () => {
    if (!token) {
      navigate("/login");
    } else {
      setOpenForm({ open: true });
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleNewPublication}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
            title="Crear publicación"
          >
            <i className="ri-add-line mr-2" />
            Nueva publicación
          </button>
        </div>

        <PublicationsFeed />

        {openForm.open && token && (
          <PublicationFormModal
            idEdit={openForm.editId}
            onClose={() => setOpenForm({ open: false })}
            onSaved={() => {
              // Si manejas estado global, aquí puedes disparar un refetch
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default PublicationsPage;
