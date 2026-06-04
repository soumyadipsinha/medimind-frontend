import api from "@/lib/api";

export const getAppointments = async (all?: boolean) => {
  const response = await api.get(`/appointments${all ? "?all=true" : ""}`);
  return response.data;
};

export const bookAppointment = async (data: any) => {
  const response = await api.post("/appointments/book", data);
  return response.data;
};

export const updateAppointmentStatus = async (id: string, status: string) => {
  const response = await api.put(`/appointments/${id}/status`, { status });
  return response.data;
};
