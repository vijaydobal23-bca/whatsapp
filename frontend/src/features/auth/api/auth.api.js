import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

export async function loginApi(email, password) {
  const response = await axiosInstance.post("/auth/login", {
    email,
    password,
  });
  return response.data;
}

export async function registerApi(username, email, password) {
  const response = await axiosInstance.post("/auth/register", {
    username,
    email,
    password,
  });
  return response.data;
}

export async function logoutApi() {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
}

export async function getMeApi() {
  const response = await axiosInstance.get("/auth/get-me");
  return response.data;
}

export async function refreshAccessTokenApi() {
  const response = await axiosInstance.post("/auth/refreshAccessToken");
  return response.data;
}