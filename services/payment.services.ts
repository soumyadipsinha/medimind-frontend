import api from "@/lib/api";

export const verifyPayment = async (data: {
  orderId: string;
  paymentId: string;
  referenceId: string;
  type: string;
  amount: number;
}) => {
  const response = await api.post("/payments/verify", data);
  return response.data;
};
