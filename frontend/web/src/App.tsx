import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Login";
import "./Css/global.css";
import Register from "./Components/Register";
import Profile from "./Components/Profile";
import PasswordResetRequest from "./Components/PasswordResetRequest";
import PasswordResetConfirm from "./Components/PasswordResetConfirm";
import ActivateAccount from "./Components/ActivateAccount";
import PublicationsPage from "./Pages/PublicationsPage";

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("accessToken");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<PasswordResetRequest />} />
        <Route path="/reset-password-confirm/:uid/:token" element={<PasswordResetConfirm />} />
        <Route path="/activate/:uid/:token" element={<ActivateAccount />} />

        {/* Protected routes */}
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


//npm i -D @types/react @types/react-dom