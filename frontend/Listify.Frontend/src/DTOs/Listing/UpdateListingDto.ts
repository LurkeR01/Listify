export type UpdateListingAttributeDto = {
  CategoryAttributeValueId: number
}

export type UpdateListingImageDto = {
  Id?: string | null
  Url: string
  Order: number
  PublicId: string
}

export type UpdateListingLocationDto = {
  Name: string
  Ref: string
  Area: string
}

export type UpdateListingDto = {
  Id: string
  Title: string
  Description: string
  Price: number
  Location: UpdateListingLocationDto
  CategoryId: number
  ListingAttributeDtos: UpdateListingAttributeDto[]
  ListingImageDtos: UpdateListingImageDto[]
}

