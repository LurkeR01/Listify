import type { ResponseUserDto } from "@/DTOs/User/UserDto";
import type { CategoryDto } from "../Category/CategoryDto";
import type { ListingAttributeValueDto } from "./ListingAttributeValueDto";
import type { ListingImageDto } from "./ListingImageDto";
import type { CityDto } from "../Location/CityDto";

export type ListingDetailDto = {
    id: string
    title: string
    description: string
    price: number
    location: CityDto
    createdOn: string | Date
    publishedByUser: ResponseUserDto
    Category: CategoryDto
    attributes: ListingAttributeValueDto[]
    images?: ListingImageDto[]
}
