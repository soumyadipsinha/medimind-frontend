import api from "@/lib/api";

export const getReports = async () => {
  const response = await api.get("/reports");
  return response.data;
};

export const bookLabTest = async (testId: string) => {
  const response = await api.post("/reports/book", { testId });
  return response.data;
};

export const uploadReportPDF = async (reportId: string, formData: FormData) => {
  const response = await api.post(`/reports/${reportId}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
