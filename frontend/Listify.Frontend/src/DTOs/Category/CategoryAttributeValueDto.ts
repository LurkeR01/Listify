export type ResponseCategoryAttributeValueDto = {
  id: number
  value: string
  categoryAttributeId: number
  categoryAttributeName: string | undefined
};

export type RequestCategoryAttributeValueDto = {
  categoryAttributeId: number
  categoryAttributeValueId: number
};