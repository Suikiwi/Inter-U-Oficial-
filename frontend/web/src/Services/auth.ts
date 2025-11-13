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
