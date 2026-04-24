import { useCallback, useMemo, useState } from "react"
import type { CategoryDto } from "@/DTOs/Category/CategoryDto"

type UseCategoryTreeProps = {
  categories: CategoryDto[]
  selectedCategory: CategoryDto | null
}

export function useCategoryTree({ categories, selectedCategory }: UseCategoryTreeProps) {
  const [categoryPath, setCategoryPath] = useState<CategoryDto[]>([])

  const rootCategories = useMemo(
    () => categories.filter((item) => item.parentId === null),
    [categories]
  )

  const categoryById = useMemo(() => {
    return new Map(categories.map((item) => [item.id, item]))
  }, [categories])

  const selectedPath = useMemo(() => {
    if (!selectedCategory) return []

    const path: CategoryDto[] = []
    let current: CategoryDto | undefined = selectedCategory
    while (current) {
      path.unshift(current)
      if (current.parentId === null) break
      current = categoryById.get(current.parentId)
    }
    return path
  }, [selectedCategory, categoryById])

  const selectedCategoryLabel = selectedPath.map((item) => item.name).join(" / ")

  const categoryColumns = useMemo(() => {
    const columns: CategoryDto[][] = [rootCategories]
    categoryPath.forEach((item) => {
      columns.push(categories.filter((category) => category.parentId === item.id))
    })
    return columns
  }, [rootCategories, categories, categoryPath])

  const selectCategoryAtColumn = useCallback((category: CategoryDto, columnIndex: number) => {
    const hasChildren = categories.some((item) => item.parentId === category.id)
    if (hasChildren) {
      setCategoryPath((prev) => [...prev.slice(0, columnIndex), category])
      return null
    }
    return category
  }, [categories])

  const syncPathFromSelection = useCallback(() => {
    if (selectedPath.length === 0) {
      setCategoryPath([])
    } else {
      setCategoryPath(selectedPath.slice(0, -1))
    }
  }, [selectedPath])

  return {
    categoryPath,
    setCategoryPath,
    selectedPath,
    selectedCategoryLabel,
    categoryColumns,
    selectCategoryAtColumn,
    syncPathFromSelection,
  }
}
