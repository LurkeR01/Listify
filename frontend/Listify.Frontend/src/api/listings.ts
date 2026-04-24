import type { RequestCategoryAttributeValueDto } from "@/DTOs/Category/CategoryAttributeValueDto"
import type { CategoryDto } from "@/DTOs/Category/CategoryDto"
import type { ListingAttributeValueDto } from "@/DTOs/Listing/ListingAttributeValueDto"
import type { CreateListingDto } from "@/DTOs/Listing/CreateListingDto"
import type { ListingDetailDto } from "@/DTOs/Listing/ListingDetailDto"
import type { ListingDto } from "@/DTOs/Listing/ListingDto"
import type { ListingImageDto } from "@/DTOs/Listing/ListingImageDto"
import type { UpdateListingDto } from "@/DTOs/Listing/UpdateListingDto"
import type { CityDto } from "@/DTOs/Location/CityDto"
import type { ResponseUserDto } from "@/DTOs/User/UserDto"
import { ListingStatus, type ListingStatus as ListingStatusType } from "@/data/home-content"
import api from "./axios"

type ListingsSearchParams = {
  categoryId?: number | null
  searchText?: string
  locationRef?: string
  minPrice?: number
  maxPrice?: number
  attributeFilters?: RequestCategoryAttributeValueDto[]
}

type ResponseListingPreviewDto = {
  id: string
  title: string
  categoryId?: number | null
  CategoryId?: number | null
  category?: { id?: number | null } | null
  publishedAt?: string | null
  PublishedAt?: string | null
  createdOn?: string | null
  CreatedOn?: string | null
  price: number
  location: CityDto
  status?: ListingStatusType | number | string | null
  imageUrl: string | null
}

type ResponseUserApiDto = {
  id: string
  username: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  phoneNumber: string | null
  registeredAt: string | null
  location: CityDto | null
  AvatarUrl?: string | null
  avatarUrl?: string | null
  AvatarPublicId?: string | null
  avatarPublicId?: string | null
}

type ResponseCategoryApiDto = {
  id: number
  name: string
  parentId: number | null
  slug: string | null
  iconKey: string | null
}

type ResponseListingAttributeValueApiDto = {
  id: number
  categoryAttributeName: string | null
  categoryAttributeValue: string | null
}

type ResponseListingImageApiDto = {
  id: string | null
  url: string | null
  order: number | null
  publicId: string | null
}

type ResponseListingDto = {
  id: string
  title: string
  description: string
  price: number
  location: CityDto
  publishedByUser: ResponseUserApiDto
  createdOn: string
  category: ResponseCategoryApiDto
  attributes: ResponseListingAttributeValueApiDto[]
  listingImages: ResponseListingImageApiDto[]
}

const toCity = (value: CityDto | null | undefined): CityDto => {
  return {
    name: String(value?.name ?? "").trim(),
    ref: String(value?.ref ?? "").trim(),
    area: String(value?.area ?? "").trim(),
  }
}

const toCategory = (value: ResponseCategoryApiDto): CategoryDto => {
  return {
    id: Number(value.id ?? 0),
    name: String(value.name ?? ""),
    parentId: value.parentId ?? null,
    slug: value.slug ?? undefined,
    iconKey: String(value.iconKey ?? ""),
  }
}

const toUser = (value: ResponseUserApiDto): ResponseUserDto => {
  return {
    id: String(value.id ?? ""),
    username: value.username ?? undefined,
    firstName: String(value.firstName ?? ""),
    lastName: String(value.lastName ?? ""),
    email: String(value.email ?? ""),
    phoneNumber: String(value.phoneNumber ?? ""),
    registeredAt: String(value.registeredAt ?? ""),
    location: value.location ? toCity(value.location) : null,
    avatarUrl: String(value.AvatarUrl ?? value.avatarUrl ?? "") || undefined,
    avatarPublicId: String(value.AvatarPublicId ?? value.avatarPublicId ?? "") || undefined,
  }
}

const toAttributes = (value: ResponseListingAttributeValueApiDto[] | null | undefined): ListingAttributeValueDto[] => {
  return (value ?? []).map((source) => {
    return {
      id: Number(source.id ?? 0),
      categoryAttributeName: String(source.categoryAttributeName ?? ""),
      categoryAttributeValue: String(source.categoryAttributeValue ?? ""),
    } satisfies ListingAttributeValueDto
  })
}

const toImages = (value: ResponseListingImageApiDto[] | null | undefined): ListingImageDto[] => {
  return (value ?? [])
    .map((item) => {
      const url = String(item.url ?? "").trim()

      if (!url) {
        return null
      }

      return {
        id: String(item.id ?? url),
        url,
        order: Number(item.order ?? 0),
        publicId: String(item.publicId ?? ""),
      } satisfies ListingImageDto
    })
    .filter((item): item is ListingImageDto => item !== null)
    .sort((a, b) => a.order - b.order)
}

const toCategoryId = (value: unknown): number | undefined => {
  const num = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN

  if (!Number.isFinite(num) || num <= 0) {
    return undefined
  }

  return num
}

const pickCategoryId = (item: ResponseListingPreviewDto): number | undefined => {
  const categoryObj = (item.category ?? undefined) as
    | { id?: unknown; Id?: unknown; categoryId?: unknown; CategoryId?: unknown }
    | undefined

  return toCategoryId(
    item.categoryId ??
      item.CategoryId ??
      categoryObj?.id ??
      categoryObj?.Id ??
      categoryObj?.categoryId ??
      categoryObj?.CategoryId,
  )
}

const toDate = (value: unknown): Date | undefined => {
  if (value instanceof Date) return value
  if (typeof value !== "string") return undefined

  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return undefined
  return date
}

const pickPublishedAt = (item: ResponseListingPreviewDto): Date | undefined => {
  return toDate(item.publishedAt ?? item.PublishedAt ?? item.createdOn ?? item.CreatedOn)
}

const toListingStatus = (value: unknown): ListingStatusType | undefined => {
  const num = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN

  if (num === ListingStatus.Draft || num === ListingStatus.Published || num === ListingStatus.Archived) {
    return num as ListingStatusType
  }

  return undefined
}

export const getListings = async (params: ListingsSearchParams) => {
  const response = await api.post<ResponseListingPreviewDto[]>("/listing/search", {
    CategoryId: params.categoryId ?? null,
    SearchText: params.searchText,
    LocationRef: params.locationRef,
    MinPrice: params.minPrice,
    MaxPrice: params.maxPrice,
    attributeFilters: params.attributeFilters,
  })

  return response.data.map((item) => {
    return {
      id: String(item.id ?? ""),
      title: String(item.title ?? ""),
      publishedAt: pickPublishedAt(item),
      price: Number(item.price ?? 0),
      location: toCity(item.location),
      imageUrl: item.imageUrl ?? undefined,
    } satisfies ListingDto
  })
}

export const getListingsForUser = async () => {
  const response = await api.get<ResponseListingPreviewDto[]>("/listing/getForUser",)

  return response.data.map((item) => {
    return {
      id: String(item.id ?? ""),
      title: String(item.title ?? ""),
      categoryId: pickCategoryId(item),
      publishedAt: pickPublishedAt(item),
      price: Number(item.price ?? 0),
      location: toCity(item.location),
      status: toListingStatus(item.status) ?? ListingStatus.Published,
      imageUrl: item.imageUrl ?? undefined,
    } satisfies ListingDto
  })
}

export const getListingById = async (id: string) => {
  const response = await api.get<ResponseListingDto>(`/listing/${id}`)
  const source = response.data

  return {
    id: String(source.id ?? ""),
    title: String(source.title ?? ""),
    description: String(source.description ?? ""),
    price: Number(source.price ?? 0),
    location: toCity(source.location),
    createdOn: String(source.createdOn ?? ""),
    publishedByUser: toUser(source.publishedByUser),
    Category: toCategory(source.category),
    attributes: toAttributes(source.attributes),
    images: toImages(source.listingImages),
  } satisfies ListingDetailDto
}

export const createListing = async (dto: CreateListingDto) => {
  const response = await api.post("/listing/create", dto)
  return response.data
}

export const updateListing = async (dto: UpdateListingDto) => {
  const response = await api.patch("/listing/update", dto)
  return response.data
}

export const deleteListing = async (listingId: string) => {
  const response = await api.delete(`/listing/${listingId}`)
  return response.data
}

export const toggleListingStatus = async (listingId: string, dto: { status: ListingStatusType }) => {
  const response = await api.patch(`/listing/${listingId}/status`, dto)
  return response.data
}