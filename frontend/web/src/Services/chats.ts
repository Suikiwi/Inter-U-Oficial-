import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const obtenerMisChats = async () => {
  const token = localStorage.getItem("accessToken");
  const { data } = await axios.get(`${API_BASE_URL}/chats/mios`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};
