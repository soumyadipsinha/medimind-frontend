import api from "@/lib/api";

export const getPrescriptions = async () => {
  const response = await api.get("/prescriptions");
  return response.data;
};

export const createPrescription = async (data: any) => {
  const response = await api.post("/prescriptions", data);
  return response.data;
};
