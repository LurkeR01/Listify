import type { CityDto } from "@/DTOs/Location/CityDto"
import api from "./axios"

export type LocationSuggestion = {
  name: string
  area: string
  ref: string
  label: string
  value: string
}

const toLocationSuggestion = (value: CityDto | null | undefined): LocationSuggestion => {
  const name = typeof value?.name === "string" ? value.name.trim() : ""
  const area = typeof value?.area === "string" ? value.area.trim() : ""
  const ref = typeof value?.ref === "string" ? value.ref.trim() : ""
  const label = area ? `${name}, ${area}` : name

  return {
    name,
    area,
    ref,
    label,
    value: label,
  }
}

export const searchLocations = async (query: string): Promise<LocationSuggestion[]> => {
  const response = await api.get<CityDto[]>("/location/search", {
    params: { q: query },
  })

  if (!Array.isArray(response.data)) {
    return []
  }

  const normalized = response.data
    .map(toLocationSuggestion)
    .filter((item) => item.name.length > 0 && item.ref.length > 0)

  const uniqueByRef = new Map<string, LocationSuggestion>()
  normalized.forEach((item) => {
    const key = item.ref || item.label
    if (!uniqueByRef.has(key)) {
      uniqueByRef.set(key, item)
    }
  })

  return Array.from(uniqueByRef.values())
}
