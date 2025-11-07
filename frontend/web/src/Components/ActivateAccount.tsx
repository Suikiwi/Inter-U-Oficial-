import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import styles from "../Css/Login.module.css";

const API_BASE_URL = "http://127.0.0.1:8000";

const ActivateAccount: React.FC = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Activando tu cuenta...");

  useEffect(() => {
    const activate = async () => {
      try {
        await axios.post(`${API_BASE_URL}/api/auth/users/activation/`, { uid, token });
        setStatus("success");
        setMessage("✅ Cuenta activada exitosamente. Ahora puedes iniciar sesión.");
      } catch (err: any) {
        setStatus("error");
        setMessage(`❌ Error: ${err.response?.data?.detail || "El enlace es inválido o expiró"}`);
      }
    };
    if (uid && token) activate();
    else { setStatus("error"); setMessage("❌ Enlace de activación inválido"); }
  }, [uid, token]);

  return (
    <div className="bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen flex items-center justify-center px-4">
      <div className={`rounded-xl p-8 ${styles.glassEffect} max-w-md w-full text-center`}>
        <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
          status === "loading" ? "bg-blue-600/30" : status === "success" ? "bg-green-600/30" : "bg-red-600/30"
        }`}>
          <i className={`text-white text-3xl ${
            status === "loading" ? "ri-loader-4-line animate-spin" : status === "success" ? "ri-check-line" : "ri-close-line"
          }`} />
        </div>
        <h2 className="text-2xl font-bold text-purple-100 mb-4">Activación de Cuenta</h2>
        <p className="text-slate-300 mb-6">{message}</p>
        {status !== "loading" && (
          <Link to="/login" className="inline-block bg-linear-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-primary transition-all">
            Ir al Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default ActivateAccount;