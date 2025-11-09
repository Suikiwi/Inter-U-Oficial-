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

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = !!localStorage.getItem("accessToken");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/publications" replace />} />

        {/* Auth pages centradas (sin header/footer) */}
        <Route
          path="/login"
          element={
            <Layout showHeader={false} showFooter={false} centerContent>
              <Login />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout showHeader={false} showFooter={false} centerContent>
              <Register />
            </Layout>
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
            <Layout showHeader={false} showFooter={false} centerContent>
              <PasswordResetConfirm />
            </Layout>
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
              <Layout>
                <Profile />
              </Layout>
            </RequireAuth>
          }
        />

        {/* Feed global */}
        <Route path="/publications" element={<PublicationsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/publications" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
