import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Profile from "./Components/Profile";
import PasswordResetRequest from "./Components/PasswordResetRequest";
import PasswordResetConfirm from "./Components/PasswordResetConfirm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<PasswordResetRequest />} />
        <Route path="/reset-password-confirm/:uid/:token" element={<PasswordResetConfirm />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;