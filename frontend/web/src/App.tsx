import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Login";
import "./Css/global.css";
import Register from "./Components/Register";
import Profile from "./Components/Profile";
import PasswordResetRequest from "./Components/PasswordResetRequest";
import PasswordResetConfirm from "./Components/PasswordResetConfirm";
import ActivateAccount from "./Components/ActivateAccount";
import PublicationsPage from "./Pages/PublicationsPage";
import { Layout } from "./Components/Layout";
import ChatPage from "./Pages/ChatPage"; // si ya lo tienes creado

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

        {/* Auth pages centradas (sin header/footer) */}
        <Route
          path="/login"
          element={
              <Login />
            
          }
        />
        <Route
          path="/register"
          element={
              <Register />
          }
        />
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
          element={
              <PasswordResetConfirm />
          }
        />
        <Route
          path="/activate/:uid/:token"
          element={
            <Layout showHeader={false} showFooter={false} centerContent>
              <ActivateAccount />
            </Layout>
          }
        />

        {/* Protegidas */}
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
