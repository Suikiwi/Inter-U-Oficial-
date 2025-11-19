import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/auth/Login";
import Register from "./Pages/auth/Register";
import Profile from "./Pages/profile/Profile";
import PasswordResetRequest from "./Pages/auth/PasswordResetRequest";
import PasswordResetConfirm from "./Pages/auth/PasswordResetConfirm";
import ActivateAccount from "./Pages/auth/ActivateAccount";
import PublicationsPage from "./Pages/publications/PublicationsPage";
import ChatPage from "./Pages/chats/ChatPage";
import HistorialChat from "./Components/chat/HistorialChat";
import ModerarReportesVisual from "./Components/reportes/ModerarReportesVisual";
import Notificaciones from "./Components/notificaciones/Notificaciones"; 
import { Layout } from "./Components/common/Layout";
import { RequireUserOnly } from "./Components/common/RequireUserOnly";
import "./css/index.css";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = !!localStorage.getItem("accessToken");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔁 Redirección raíz al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Páginas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/reset-password"
          element={
            <Layout showHeader={false} showFooter={false} centerContent>
              <PasswordResetRequest />
            </Layout>
          }
        />
        <Route
          path="/reset-password-confirm/:uid/:token"
          element={<PasswordResetConfirm />}
        />
        <Route
          path="/activate/:uid/:token"
          element={
            <Layout showHeader={false} showFooter={false} centerContent>
              <ActivateAccount />
            </Layout>
          }
        />

        {/* Páginas protegidas solo para usuarios normales */}
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <RequireUserOnly>
                <Profile />
              </RequireUserOnly>
            </RequireAuth>
          }
        />
        <Route
          path="/publications"
          element={
            <RequireAuth>
              <RequireUserOnly>
                <PublicationsPage />
              </RequireUserOnly>
            </RequireAuth>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <RequireAuth>
              <RequireUserOnly>
                <Layout>
                  <ChatPage />
                </Layout>
              </RequireUserOnly>
            </RequireAuth>
          }
        />
        <Route
          path="/historial-chat"
          element={
            <RequireAuth>
              <RequireUserOnly>
                <Layout>
                  <HistorialChat />
                </Layout>
              </RequireUserOnly>
            </RequireAuth>
          }
        />
        <Route
          path="/notificaciones"
          element={
            <RequireAuth>
              <RequireUserOnly>
                <Layout>
                  <Notificaciones /> 
                </Layout>
              </RequireUserOnly>
            </RequireAuth>
          }
        />

        {/* Página exclusiva para admin */}
        <Route
          path="/moderar-reportes"
          element={
            <RequireAuth>
              <ModerarReportesVisual />
            </RequireAuth>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
