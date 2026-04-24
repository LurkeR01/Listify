import api from "./axios";
import type { RegisterUserRequestDto } from "@/DTOs/User/UserDto";

export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data.accessToken as string;
}

export const register = async (payload: RegisterUserRequestDto) => {
  const response = await api.post("/auth/register", payload);
  return response.status;
}
