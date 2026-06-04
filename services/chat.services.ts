import api from "@/lib/api";

export const getChatUsers = async () => {
  const response = await api.get("/chats/users");
  return response.data;
};

export const getChatMessages = async (partnerId: string) => {
  const response = await api.get(`/chats/${partnerId}`);
  return response.data;
};

export const markChatAsSeen = async (partnerId: string) => {
  const response = await api.post("/chats/seen", { partnerId });
  return response.data;
};
