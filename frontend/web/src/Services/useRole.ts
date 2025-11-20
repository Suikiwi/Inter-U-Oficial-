import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export type RoleInfo = { is_admin_interu: boolean; is_estudiante: boolean };

export function useRole() {
  const [role, setRole] = useState<RoleInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setRole(null);
      setLoading(false);
      return;
    }

    axios
      .get(`${API_BASE_URL}/auth/users/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setRole({
          is_admin_interu: !!res.data.is_admin_interu,
          is_estudiante: !!res.data.is_estudiante,
        });
      })
      .catch(() => setRole(null))
      .finally(() => setLoading(false));
  }, []);

  return { role, loading };
}
