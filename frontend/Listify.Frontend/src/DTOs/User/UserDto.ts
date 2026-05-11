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

export type UserRatingRequestDto = {
  RatedUserId: string
  ListingId: string
  Rating: number
  Comment?: string | null
}

export type ResponseUserRatingDto = {
  id?: string
  Id?: string
  fromUserId?: string
  FromUserId?: string
  toUserId?: string
  ToUserId?: string
  listingId?: string
  ListingId?: string
  rating?: number
  Rating?: number
  comment?: string | null
  Comment?: string | null
  createdAt?: string
  CreatedAt?: string
  fromUser?: ResponseUserDto | null
  FromUser?: ResponseUserDto | null
  toUser?: ResponseUserDto | null
  ToUser?: ResponseUserDto | null
}

export type UserRatingDto = {
  id: string
  rating: number
  comment?: string
  fromUserId: string
  toUserId: string
  listingId: string
  createdAt: string
  fromUser?: ResponseUserDto
  toUser?: ResponseUserDto
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
