import api from "../services/axios";

export const getGlobalLeaderboard = async () => {
  const response = await api.get("/leaderboard/global");
  return response.data;
};