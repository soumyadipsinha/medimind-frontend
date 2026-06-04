import api from "@/lib/api";

export const getPatients = async () => {
  const response = await api.get("/patients");
  return response.data;
};

export const getPatientLogs = async (id: string) => {
  const response = await api.get(`/patients/${id}/logs`);
  return response.data;
};
