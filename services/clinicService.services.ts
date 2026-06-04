import api from "@/lib/api";

export const getClinicServices = async () => {
  const response = await api.get("/services");
  return response.data;
};

export const createClinicService = async (data: any) => {
  const response = await api.post("/services", data);
  return response.data;
};

export const updateClinicService = async (id: string, data: any) => {
  const response = await api.put(`/services/${id}`, data);
  return response.data;
};

export const deleteClinicService = async (id: string) => {
  const response = await api.delete(`/services/${id}`);
  return response.data;
};
