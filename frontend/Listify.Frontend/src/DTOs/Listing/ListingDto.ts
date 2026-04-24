import type { ListingStatus } from "@/data/home-content"
import type { CityDto } from "../Location/CityDto"

export type ListingDto = {
    id: string
    title: string
    categoryId?: number
    price: number
    location: CityDto
    status?: ListingStatus
    publishedAt?: Date
    imageUrl?: string
}
