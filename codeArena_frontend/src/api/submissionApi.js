import api from "../services/axios";

export const getMySubmissions = async () => {
  const response = await api.get("/submissions/my");
  return response.data;
};

export const getSubmissionById = async (submissionId) => {
  const response = await api.get(`/submissions/${submissionId}`);
  return response.data;
};