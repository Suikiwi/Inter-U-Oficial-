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
import ModerarReportesPage from "./Pages/admin/ModerarReportesPage";
import Notificaciones from "./Components/notificaciones/Notificaciones";
import { Layout } from "./Components/common/Layout";
import "./css/index.css";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const hasToken = !!localStorage.getItem("accessToken");
  return hasToken ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Base */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Públicas */}
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
        <Route path="/reset-password-confirm/:uid/:token" element={<PasswordResetConfirm />} />
        <Route
          path="/activate/:uid/:token"
          element={
            <Layout showHeader={false} showFooter={false} centerContent>
              <ActivateAccount />
            </Layout>
          }
        />

        {/* Protegidas por token (sin reevaluar rol) */}
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/publications"
          element={
            <RequireAuth>
              <PublicationsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <RequireAuth>
              <Layout>
                <ChatPage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/historial-chat"
          element={
            <RequireAuth>
              <Layout>
                <HistorialChat />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/notificaciones"
          element={
            <RequireAuth>
              <Layout>
                <Notificaciones />
              </Layout>
            </RequireAuth>
          }
        />

        <Route
          path="/moderar-reportes"
          element={
            <RequireAuth>
              <Layout>
                <ModerarReportesPage />
              </Layout>
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
