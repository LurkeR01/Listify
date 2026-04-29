import type { CityDto } from "@/DTOs/Location/CityDto"

export type ListingPreviewDto = {
  id: string
  title: string
  price: number
  location: CityDto
  imageUrl?: string
}

