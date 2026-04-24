import type { ResponseCategoryAttributeValueDto } from "@/DTOs/Category/CategoryAttributeValueDto";

export type CategoryAttributeDto = {
  id: number
  name: string
  values: ResponseCategoryAttributeValueDto[]
}