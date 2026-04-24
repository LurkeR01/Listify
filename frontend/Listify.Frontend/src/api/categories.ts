import api from "./axios";
import type { CategoryDto } from "@/DTOs/Category/CategoryDto";


export const getCategories = async () => {
  const response = await api.get<CategoryDto[]>("/category");
  return response.data;
};

export const getAttributesByCategoryId = async (categoryId: number) => {
  const response = await api.get(`/category/${categoryId}`)
  return response.data;
};
