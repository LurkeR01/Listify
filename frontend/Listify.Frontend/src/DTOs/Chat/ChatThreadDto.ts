import type { ListingPreviewDto } from "@/DTOs/Chat/ListingPreviewDto"
import type { MessageDto } from "@/DTOs/Chat/MessageDto"
import type { ShortResponseUserDto } from "@/DTOs/Chat/ShortResponseUserDto"

export type ChatThreadMode = "selling" | "buying"

export type ChatThreadDto = {
  id: string
  listingPreview: ListingPreviewDto
  buyer: ShortResponseUserDto
  seller: ShortResponseUserDto
  lastMessage: MessageDto | null
  messages: MessageDto[]
  updatedAt: string
}
