import api from "../services/axios";

export const registerUser = async (data) => {

  const response = await api.post("/auth/register", data);

  return response.data;
};


export const loginUser = async (data) => {

  const response = await api.post("/auth/login", data);

  return response.data;
};


// ========================================
// FORGOT PASSWORD
// ========================================

export const forgotPassword = async (data) => {

  const response = await api.post(
    "/auth/forgot-password",
    data
  );

  return response.data;
};


// ========================================
// RESET PASSWORD
// ========================================

export const resetPassword = async (data) => {

  const response = await api.post(
    "/auth/reset-password",
    data
  );

  return response.data;
};