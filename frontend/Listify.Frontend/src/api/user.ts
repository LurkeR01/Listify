import api from "./axios"
import type { CityDto } from "@/DTOs/Location/CityDto"
import type { EditUserRequestDto, ResponseUserDto } from "@/DTOs/User/UserDto"

type ResponseLocationApiDto = {
  Name?: string | null
  name?: string | null
  Ref?: string | null
  ref?: string | null
  Area?: string | null
  area?: string | null
}

type ResponseUserApiDto = {
  Id?: string
  id?: string
  Username?: string | null
  username?: string | null
  FirstName?: string | null
  firstName?: string | null
  LastName?: string | null
  lastName?: string | null
  Email?: string | null
  email?: string | null
  PhoneNumber?: string | null
  phoneNumber?: string | null
  RegisteredAt?: string | null
  registeredAt?: string | null
  Location?: ResponseLocationApiDto | null
  location?: ResponseLocationApiDto | null
  AvatarUrl?: string | null
  avatarUrl?: string | null
  AvatarPublicId?: string | null
  avatarPublicId?: string | null
}

const toCity = (value: ResponseLocationApiDto | null | undefined): CityDto | null => {
  const name = String(value?.Name ?? value?.name ?? "").trim()
  const ref = String(value?.Ref ?? value?.ref ?? "").trim()
  const area = String(value?.Area ?? value?.area ?? "").trim()

  if (!name && !ref && !area) {
    return null
  }

  return { name, ref, area }
}

const toUser = (value: ResponseUserApiDto): ResponseUserDto => {
  return {
    id: String(value.Id ?? value.id ?? ""),
    username: value.Username ?? value.username ?? undefined,
    firstName: String(value.FirstName ?? value.firstName ?? ""),
    lastName: String(value.LastName ?? value.lastName ?? ""),
    email: String(value.Email ?? value.email ?? ""),
    phoneNumber: String(value.PhoneNumber ?? value.phoneNumber ?? ""),
    registeredAt: String(value.RegisteredAt ?? value.registeredAt ?? ""),
    location: toCity(value.Location ?? value.location),
    avatarUrl: String(value.AvatarUrl ?? value.avatarUrl ?? "") || undefined,
    avatarPublicId: String(value.AvatarPublicId ?? value.avatarPublicId ?? "") || undefined,
  }
}

export const getCurrentUser = async () => {
  const response = await api.get<ResponseUserApiDto>("/user/me")
  return toUser(response.data)
}

export const updateUserProfile = async (user: EditUserRequestDto) => {
  const response = await api.patch<ResponseUserApiDto | null>("/user/edit", user)
  return response.data ? toUser(response.data) : null
}
