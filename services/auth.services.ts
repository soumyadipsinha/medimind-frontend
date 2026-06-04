import api from "@/lib/api";

export const getSession = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const login = async (credentials: any) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const register = async (patientData: any) => {
  const response = await api.post("/auth/register", patientData);
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};
