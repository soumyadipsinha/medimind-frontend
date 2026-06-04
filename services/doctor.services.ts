import api from "@/lib/api";

export const getDoctors = async () => {
  const response = await api.get("/doctors");
  return response.data;
};

export const createDoctor = async (data: any) => {
  const response = await api.post("/doctors", data);
  return response.data;
};

export const updateDoctor = async (id: string, data: any) => {
  const response = await api.put(`/doctors/${id}`, data);
  return response.data;
};

export const deleteDoctor = async (id: string) => {
  const response = await api.delete(`/doctors/${id}`);
  return response.data;
};
