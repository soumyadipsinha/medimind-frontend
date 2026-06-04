import api from "@/lib/api";

export const getDepartments = async () => {
  const response = await api.get("/departments");
  return response.data;
};

export const createDepartment = async (data: any) => {
  const response = await api.post("/departments", data);
  return response.data;
};

export const updateDepartment = async (id: string, data: any) => {
  const response = await api.put(`/departments/${id}`, data);
  return response.data;
};

export const deleteDepartment = async (id: string) => {
  const response = await api.delete(`/departments/${id}`);
  return response.data;
};
