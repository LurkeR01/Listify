import { useMemo } from "react"
import type { ListingDto } from "@/DTOs/Listing/ListingDto"
import type { CategoryDto } from "@/DTOs/Category/CategoryDto"

type Params = {
  listings: ListingDto[]
  categories: CategoryDto[]
  searchText: string
  selectedCategory: CategoryDto | null
  sortOption: string
}

export function useListingsFilterSort({ listings, categories, searchText, selectedCategory, sortOption }: Params) {
  const allowedCategoryIds = useMemo(() => {
    const selectedId = selectedCategory?.id ?? null
    if (selectedId === null) return null

    const childrenByParent = new Map<number, number[]>()
    categories.forEach((category) => {
      if (category.parentId === null) return
      const list = childrenByParent.get(category.parentId) ?? []
      list.push(category.id)
      childrenByParent.set(category.parentId, list)
    })

    const ids = new Set<number>()
    const stack = [selectedId]

    while (stack.length > 0) {
      const currentId = stack.pop()
      if (currentId === undefined) continue
      if (ids.has(currentId)) continue
      ids.add(currentId)

      const children = childrenByParent.get(currentId) ?? []
      children.forEach((childId) => stack.push(childId))
    }

    return ids
  }, [categories, selectedCategory])

  const filteredListings = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()
    const selectedCategoryId = selectedCategory?.id ?? null

    return listings.filter((listing) => {
      const matchesSearch = normalizedSearch === "" ? true : listing.title.toLowerCase().includes(normalizedSearch)

      const matchesCategory = selectedCategoryId === null
        ? true
        : listing.categoryId !== undefined && (allowedCategoryIds?.has(listing.categoryId) ?? false)

      return matchesSearch && matchesCategory
    })
  }, [listings, searchText, selectedCategory, allowedCategoryIds])

  const sortedListings = useMemo(() => {
    const items = filteredListings.slice()

    const getPublishedTime = (listing: ListingDto) => listing.publishedAt?.getTime() ?? 0

    switch (sortOption) {
      case "По алфавиту":
        return items.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }))
      case "Дешевле":
        return items.sort((a, b) => a.price - b.price)
      case "Дороже":
        return items.sort((a, b) => b.price - a.price)
      case "По дате публикации":
      default:
        return items.sort((a, b) => getPublishedTime(b) - getPublishedTime(a))
    }
  }, [filteredListings, sortOption])

  return { allowedCategoryIds, filteredListings, sortedListings }
}
