import type { CityDto } from "../Location/CityDto"

export type RegisterUserRequestDto = {
  username?: string
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
}

export type EditUserLocationRequestDto = {
  Name: string
  Ref: string
  Area: string
}

export type EditUserRequestDto = {
  FirstName: string
  LastName: string
  Email: string
  PhoneNumber: string
  Location: EditUserLocationRequestDto | null
  AvatarUrl?: string | null
  AvatarPublicId?: string | null
}

export type ResponseUserDto = {
  id: string
  username?: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  registeredAt: string | Date
  location: CityDto | null
  avatarUrl?: string | null
  avatarPublicId?: string | null
}
