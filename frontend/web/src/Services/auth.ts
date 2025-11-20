import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Activar cuenta de usuario con uid y token enviados por correo
 */
export const activarCuenta = async (uid: string, token: string) => {
  return axios.post(
    `${API_BASE_URL}/auth/users/activation/`,
    { uid, token },
    { headers: { "Content-Type": "application/json" } }
  );
};

/**
 * Obtener el ID del usuario desde el accessToken
 */
export const getUserIdFromAccessToken = (): number | null => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const [, payloadB64] = token.split(".");
    const json = JSON.parse(atob(payloadB64));
    const raw = json.user_id ?? json.userId ?? json.sub;
    if (raw == null) return null;
    const n = typeof raw === "string" ? parseInt(raw, 10) : raw;
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
};

/**
 * Detectar si el usuario es administrador InterU
 * (usa tu flag personalizado is_admin_interu que viene en el JWT)
 */
export const isAdminFromToken = (): boolean => {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;
  try {
    const [, payloadB64] = token.split(".");
    const json = JSON.parse(atob(payloadB64));
    return json?.is_admin_interu === true; 
  } catch {
    return false;
  }
};

/**
 * Detectar si el usuario es superusuario global de Django
 */
export const isSuperUser = (): boolean => {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;
  try {
    const [, payloadB64] = token.split(".");
    const json = JSON.parse(atob(payloadB64));
    return json?.is_superuser === true;
  } catch {
    return false;
  }
};

/**
 * Obtener alias del usuario desde el token (si existe)
 */
export const getAliasFromToken = (): string | null => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const [, payloadB64] = token.split(".");
    const json = JSON.parse(atob(payloadB64));
    return typeof json?.alias === "string" ? json.alias : null;
  } catch {
    return null;
  }
};
