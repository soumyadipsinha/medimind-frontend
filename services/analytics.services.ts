import api from "@/lib/api";

export const getAdminDashboardMetrics = async () => {
  const response = await api.get("/analytics/dashboard");
  return response.data;
};
