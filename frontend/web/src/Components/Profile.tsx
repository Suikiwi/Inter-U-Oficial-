import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useProfile } from "../Hooks/useProfile";
import type { PerfilData } from "../Hooks/useProfile";
import EditProfileModal from "./EditProfileModal";
import DeleteAccountModal from "./DeleteAccountModal";
import styles from "../Css/Profile.module.css";
import MyPublicationsList from "./Publications/MyPublicationsList";
import PublicationFormModal from "./Publications/PublicationFormModal";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { perfil, user, loading, error, updateProfile, deleteAccount } = useProfile();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success" | "info"; message: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) navigate("/login", { replace: true });
  }, [navigate]);

  const showAlert = (type: "error" | "success" | "info", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login", { replace: true });
  };

  const handleUpdateProfile = async (data: Partial<PerfilData>) => {
    try {
      await updateProfile(data);
      showAlert("success", "Perfil actualizado correctamente");
    } catch (err: any) {
      showAlert("error", err.message);
    }
  };

  const handleDeleteAccount = async (password: string) => {
    try {
      await deleteAccount(password);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login", { replace: true });
      showAlert("info", "Cuenta eliminada correctamente");
    } catch (err: any) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-purple-400 animate-spin"></i>
          <p className="text-slate-300 mt-4">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
          <p className="font-medium">Error al cargar el perfil</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen relative overflow-x-hidden">
      {/* Fondos */}
      <div className="fixed inset-0 bg-[radial-linear(ellipse_at_top,var(--tw-linear-stops))] from-purple-900/20 via-slate-900/50 to-black/80 pointer-events-none"></div>
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>

      {/* Header */}
      <header className={`relative z-10 ${styles.glassEffect}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 border-b border-purple-500/20">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-['Pacifico'] text-2xl text-primary font-bold">Inter-U</Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-300">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600/80 hover:bg-red-600 px-4 py-2 rounded-lg text-sm text-white transition-all"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Alertas */}
      {alert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4">
          <div
            className={`px-6 py-3 rounded-lg border text-sm backdrop-blur-md ${
              alert.type === "error"
                ? "bg-red-100 border-red-400 text-red-700"
                : "bg-green-100 border-green-400 text-green-700"
            }`}
          >
            <div className="font-medium">{alert.message}</div>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="relative z-10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <aside className="space-y-8">
              <div className={`rounded-xl p-8 ${styles.glassEffect} ${styles.glowAnimation}`}>
                <div className="text-center">
                  {perfil?.foto ? (
                    <img
                      src={perfil.foto}
                      alt="Foto de perfil"
                      className="w-24 h-24 mx-auto mb-6 rounded-full object-cover border border-slate-600/50"
                    />
                  ) : (
                    <div
                      className={`w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-r from-primary to-purple-600 flex items-center justify-center ${styles.floatAnimation}`}
                    >
                      <i className="ri-user-line text-white text-3xl"></i>
                    </div>
                  )}

                  <h1 className="text-2xl font-bold text-purple-100 mb-1">
                    {perfil?.alias ||
                      `${perfil?.nombre || ""} ${perfil?.apellido || ""}`.trim() ||
                      "Estudiante"}
                  </h1>

                  <p className="text-slate-400 mb-4">{perfil?.carrera}</p>

                  <div className="space-y-2 text-left bg-slate-900/30 p-4 rounded-lg mb-6">
                    <p className="text-sm text-slate-300">
                      <i className="ri-mail-line mr-2"></i> {user?.email}
                    </p>
                    <p className="text-sm text-slate-300">
                      <i className="ri-graduation-cap-line mr-2"></i> {perfil?.area}
                    </p>
                    <p className="text-sm text-slate-300">
                      <i className="ri-shield-check-line mr-2"></i>{" "}
                      {perfil?.habilidades_ofrecidas?.length || 0} habilidades
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="w-full bg-linear-to-r from-primary to-purple-600 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-primary transition-all"
                    >
                      <i className="ri-edit-line mr-2"></i> Editar Perfil
                    </button>

                    <Link
                      to="/publications"
                      className="w-full inline-flex items-center justify-center px-4 py-3 border border-purple-600 text-purple-100 rounded-lg font-medium hover:bg-purple-700/10 transition-all"
                    >
                      <i className="ri-folder-open-line mr-2"></i> Explorar publicaciones
                    </Link>

                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full bg-red-600/80 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-all"
                    >
                      <i className="ri-delete-bin-line mr-2"></i> Eliminar Cuenta
                    </button>
                  </div>
                </div>
              </div>

              {/* Habilidades */}
              <div className={`rounded-xl p-6 ${styles.glassEffect}`}>
                <h3 className="text-lg font-semibold text-purple-100 mb-4 flex items-center">
                  <i className="ri-star-line mr-2"></i> Habilidades Ofrecidas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {perfil?.habilidades_ofrecidas?.length ? (
                    perfil.habilidades_ofrecidas.map((hab, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-600/30 text-purple-200 rounded-full text-sm"
                      >
                        {hab}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm">No hay habilidades registradas</p>
                  )}
                </div>
              </div>
            </aside>

            {/* Contenido principal */}
            <section className="lg:col-span-2 space-y-8">
              <div className={`rounded-xl p-8 ${styles.glassEffect} ${styles.glowAnimation}`}>
                <h2 className="text-2xl font-bold text-purple-100 mb-4">Bienvenido a tu Perfil</h2>
                <p className="text-slate-300 leading-relaxed">
                  {perfil?.biografia ||
                    "Aún no has agregado una biografía. Edita tu perfil para contarnos más sobre ti."}
                </p>
              </div>

              <div className={`rounded-xl p-8 ${styles.glassEffect}`}>
                <h3 className="text-xl font-semibold text-purple-100 mb-6">Información Completa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">Nombre completo</p>
                    <p className="font-medium text-white">
                      {perfil?.nombre} {perfil?.apellido}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">Email institucional</p>
                    <p className="font-medium text-white">{user?.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">Carrera</p>
                    <p className="font-medium text-white">{perfil?.carrera}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">Área de especialización</p>
                    <p className="font-medium text-white">{perfil?.area}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">Cuenta verificada</p>
                    <p className="font-medium text-green-400 flex items-center">
                      <i className="ri-checkbox-circle-line mr-1"></i> Sí
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">Tipo de usuario</p>
                    <p className="font-medium text-white">
                      {user?.is_admin_interu ? "Administrador" : "Estudiante"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mis publicaciones con botón de creación */}
              <div className={`rounded-xl p-8 ${styles.glassEffect}`}>
                <div className="flex justify-between items-center mb-6">
                 
                </div>

                <MyPublicationsList />
                 <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-10 h-10 flex items-center justify-center bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all"
                    title="Crear publicación"
                  >
                    <i className="ri-add-line text-2xl" />
                  </button>

                {showCreateModal && (
                  <PublicationFormModal
                    onClose={() => setShowCreateModal(false)}
                    onSaved={() => setShowCreateModal(false)}
                  />
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Modales */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        perfil={perfil}
        onSave={handleUpdateProfile}
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
};

export default Profile;
