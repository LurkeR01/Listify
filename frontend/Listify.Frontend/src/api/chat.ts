import api from "@/api/axios"
import type { ConversationDto } from "@/DTOs/Chat/ConversationDto"
import type { ListingPreviewDto } from "@/DTOs/Chat/ListingPreviewDto"
import type { MessageDto } from "@/DTOs/Chat/MessageDto"
import type { ShortResponseUserDto } from "@/DTOs/Chat/ShortResponseUserDto"
import type { CityDto } from "@/DTOs/Location/CityDto"

export type RequestConnectionDto = {
  listingId: string
  sellerId: string
}

type ResponseListingPreviewApiDto = {
  id?: string
  Id?: string
  title?: string
  Title?: string
  price?: number
  Price?: number
  location?: CityDto
  Location?: CityDto
  imageUrl?: string | null
  ImageUrl?: string | null
}

type ResponseShortUserApiDto = {
  id?: string
  Id?: string
  firstName?: string
  FirstName?: string
  avatarUrl?: string | null
  AvatarUrl?: string | null
  avatarPublicId?: string | null
  AvatarPublicId?: string | null
}

type ResponseMessageApiDto = {
  id?: string
  Id?: string
  text?: string
  Text?: string
  sender?: ResponseShortUserApiDto
  Sender?: ResponseShortUserApiDto
  createdAt?: string
  CreatedAt?: string
}

type ResponseConversationApiDto = {
  id?: string
  Id?: string
  listingPreview?: ResponseListingPreviewApiDto
  ListingPreview?: ResponseListingPreviewApiDto
  participants?: ResponseShortUserApiDto[]
  Participants?: ResponseShortUserApiDto[]
  lastMessages?: ResponseMessageApiDto[]
  LastMessages?: ResponseMessageApiDto[]
}

const toCity = (value: CityDto | null | undefined): CityDto => {
  return {
    name: String(value?.name ?? "").trim(),
    ref: String(value?.ref ?? "").trim(),
    area: String(value?.area ?? "").trim(),
  }
}

const toShortUser = (value: ResponseShortUserApiDto | null | undefined): ShortResponseUserDto => {
  return {
    id: String(value?.id ?? value?.Id ?? ""),
    firstName: String(value?.firstName ?? value?.FirstName ?? ""),
    avatarUrl: String(value?.avatarUrl ?? value?.AvatarUrl ?? "").trim() || undefined,
    avatarPublicId: String(value?.avatarPublicId ?? value?.AvatarPublicId ?? "").trim() || undefined,
  }
}

const toListingPreview = (value: ResponseListingPreviewApiDto | null | undefined): ListingPreviewDto => {
  return {
    id: String(value?.id ?? value?.Id ?? ""),
    title: String(value?.title ?? value?.Title ?? ""),
    price: Number(value?.price ?? value?.Price ?? 0),
    location: toCity(value?.location ?? value?.Location),
    imageUrl: String(value?.imageUrl ?? value?.ImageUrl ?? "").trim() || undefined,
  }
}

const toMessage = (value: ResponseMessageApiDto | null | undefined): MessageDto => {
  const sender = value?.sender ?? value?.Sender
  return {
    id: String(value?.id ?? value?.Id ?? ""),
    text: String(value?.text ?? value?.Text ?? ""),
    sender: toShortUser(sender),
    createdAt: String(value?.createdAt ?? value?.CreatedAt ?? ""),
    imageUrl: undefined,
    imageName: undefined,
  }
}

export const connectConversation = async (dto: RequestConnectionDto): Promise<ConversationDto> => {
  const response = await api.post<ResponseConversationApiDto>("/chat/connect", {
    listingId: dto.listingId,
    sellerId: dto.sellerId,
  })

  const source = response.data

  return {
    id: String(source.id ?? source.Id ?? ""),
    listingPreview: toListingPreview(source.listingPreview ?? source.ListingPreview),
    participants: (source.participants ?? source.Participants ?? []).map(toShortUser),
    lastMessages: (source.lastMessages ?? source.LastMessages ?? []).map(toMessage),
  }
}
