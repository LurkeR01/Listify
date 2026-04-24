export type CreateListingAttributeDto = {
  CategoryAttributeValueId: number
}

export type CreateListingImageDto = {
  Url: string
  Order: number
  PublicId: string
}

export type CreateListingLocationDto = {
  Name: string
  Ref: string
  Area: string
}

export type CreateListingDto = {
  Title: string
  Description: string
  Price: number
  Location: CreateListingLocationDto
  CategoryId: number
  ListingAttributeDtos: CreateListingAttributeDto[]
  ListingImageDtos: CreateListingImageDto[]
}
