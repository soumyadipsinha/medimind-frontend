import api from "@/lib/api";

export const getMyNotifications = async (params?: { limit?: number; offset?: number }) => {
  const response = await api.get("/notification", { params });
  return response.data;
};

export const markAsRead = async (id: string) => {
  const response = await api.patch(`/notification/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.patch("/notification/read-all");
  return response.data;
};
