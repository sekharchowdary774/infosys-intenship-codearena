import api from "../services/axios";

export const getStudyPlans = async () => {
  const response = await api.get("/study-plans");
  return response.data;
};

export const getStudyPlan = async (planId) => {
  const response = await api.get(`/study-plans/${planId}`);
  return response.data;
};

export const getStudyPlanProblems = async (planId) => {
  const response = await api.get(
    `/study-plans/${planId}/problems`
  );

  return response.data;
};