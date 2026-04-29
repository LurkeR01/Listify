import type { ListingPreviewDto } from "@/DTOs/Chat/ListingPreviewDto"
import type { MessageDto } from "@/DTOs/Chat/MessageDto"
import type { ShortResponseUserDto } from "@/DTOs/Chat/ShortResponseUserDto"

export type ConversationDto = {
  id: string
  listingPreview: ListingPreviewDto
  participants: ShortResponseUserDto[]
  lastMessages: MessageDto[]
}

