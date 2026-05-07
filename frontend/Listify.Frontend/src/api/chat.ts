import api from "@/api/axios"
import type { ConversationDto } from "@/DTOs/Chat/ConversationDto"
import type { ListingPreviewDto } from "@/DTOs/Chat/ListingPreviewDto"
import type { MessageDto } from "@/DTOs/Chat/MessageDto"
import type { ShortResponseUserDto } from "@/DTOs/Chat/ShortResponseUserDto"
import type { ChatThreadDto } from "@/DTOs/Chat/ChatThreadDto"
import type { CityDto } from "@/DTOs/Location/CityDto"

export type RequestConnectionDto = {
  listingId: string
  sellerId?: string
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
  senderId?: string
  SenderId?: string
  createdAt?: string
  CreatedAt?: string
}

type ResponseConversationApiDto = {
  id?: string
  Id?: string
  listingPreview?: ResponseListingPreviewApiDto
  ListingPreview?: ResponseListingPreviewApiDto
  buyer?: ResponseShortUserApiDto
  Buyer?: ResponseShortUserApiDto
  seller?: ResponseShortUserApiDto
  Seller?: ResponseShortUserApiDto
  participants?: ResponseShortUserApiDto[]
  Participants?: ResponseShortUserApiDto[]
  messages?: ResponseMessageApiDto[]
  Messages?: ResponseMessageApiDto[]
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

const sortMessagesByCreatedAt = (messages: MessageDto[]) => {
  return [...messages].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime()
    const bTime = new Date(b.createdAt).getTime()
    return (Number.isNaN(aTime) ? 0 : aTime) - (Number.isNaN(bTime) ? 0 : bTime)
  })
}

const toConversation = (source: ResponseConversationApiDto): ConversationDto => {
  const responseParticipants = (source.participants ?? source.Participants ?? []).map(toShortUser)
  const buyer = toShortUser(source.buyer ?? source.Buyer)
  const seller = toShortUser(source.seller ?? source.Seller)
  const participants = [buyer, seller, ...responseParticipants].filter(
    (participant, index, all) =>
      participant.id.trim() &&
      all.findIndex((candidate) => candidate.id.trim().toLowerCase() === participant.id.trim().toLowerCase()) === index,
  )
  const participantsById = new Map(participants.map((p) => [p.id.trim().toLowerCase(), p]))

  const toMessageWithParticipants = (value: ResponseMessageApiDto | null | undefined): MessageDto => {
    const sender = value?.sender ?? value?.Sender
    const senderId = String(value?.senderId ?? value?.SenderId ?? sender?.id ?? sender?.Id ?? "").trim()
    const normalizedSenderId = senderId.toLowerCase()

    const explicitSender = toShortUser(sender)
    const hasExplicitSenderInfo = Boolean(explicitSender.id || explicitSender.firstName || explicitSender.avatarUrl || explicitSender.avatarPublicId)

    const resolvedSender =
      participantsById.get(normalizedSenderId) ??
      (hasExplicitSenderInfo ? explicitSender : undefined) ??
      { id: senderId, firstName: "Користувач" }

    return {
      id: String(value?.id ?? value?.Id ?? ""),
      text: String(value?.text ?? value?.Text ?? ""),
      sender: resolvedSender,
      createdAt: String(value?.createdAt ?? value?.CreatedAt ?? ""),
      imageUrl: undefined,
      imageName: undefined,
    }
  }

  const sourceMessages = source.messages ?? source.Messages ?? source.lastMessages ?? source.LastMessages ?? []
  const lastMessages = sortMessagesByCreatedAt(sourceMessages.map(toMessageWithParticipants))

  return {
    id: String(source.id ?? source.Id ?? ""),
    listingPreview: toListingPreview(source.listingPreview ?? source.ListingPreview),
    participants,
    lastMessages,
  }
}

export const connectConversation = async (dto: RequestConnectionDto): Promise<ConversationDto> => {
  const response = await api.post<ResponseConversationApiDto>("/chat/connect", {
    listingId: dto.listingId,
  })

  return toConversation(response.data)
}

export const getChatThreads = async (): Promise<ChatThreadDto[]> => {
  const response = await api.get<ResponseConversationApiDto[]>("/chat")

  return response.data.map((source) => {
    const conversation = toConversation(source)
    const buyer = toShortUser(source.buyer ?? source.Buyer)
    const seller = toShortUser(source.seller ?? source.Seller)
    const lastMessage = conversation.lastMessages.at(-1) ?? null

    return {
      id: conversation.id,
      listingPreview: conversation.listingPreview,
      buyer,
      seller,
      lastMessage,
      messages: conversation.lastMessages,
      updatedAt: lastMessage?.createdAt ?? "",
    }
  })
}

export const getChatHubUrl = (): string => {
  const base = String(api.defaults.baseURL ?? "").trim()
  if (!base) return "/chat"
  return base.replace(/\/api\/?$/i, "") + "/chat"
}
