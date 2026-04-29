import type { ShortResponseUserDto } from "@/DTOs/Chat/ShortResponseUserDto"

export type MessageDto = {
  id: string
  text: string
  sender: ShortResponseUserDto
  createdAt: string
  imageUrl?: string
  imageName?: string
}
