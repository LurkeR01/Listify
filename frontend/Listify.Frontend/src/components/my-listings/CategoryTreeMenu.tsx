import { Button, Menu, Portal, Text, HStack, Box } from "@chakra-ui/react"
import { LuChevronRight, LuLayoutGrid, LuX } from "react-icons/lu"
import { useMemo, useState } from "react"
import type { CategoryDto } from "@/DTOs/Category/CategoryDto"

interface CategoryMenuProps {
  categories: CategoryDto[]
  onSelect: (category: CategoryDto | null) => void // Дозволяємо скидання
}

export const CategoryTreeMenu = ({ categories, onSelect }: CategoryMenuProps) => {
  // Додаємо внутрішній стан для відображення назви на кнопці
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(null)

  const categoryById = useMemo(() => {
    const map = new Map<number, CategoryDto>()
    categories.forEach((category) => {
      map.set(category.id, category)
    })
    return map
  }, [categories])

  const categoriesByParent = useMemo(() => {
    const map: Record<number | "root", CategoryDto[]> = { root: [] }
    categories.forEach((cat) => {
      if (cat.parentId === null) {
        map.root.push(cat)
      } else {
        if (!map[cat.parentId]) map[cat.parentId] = []
        map[cat.parentId].push(cat)
      }
    })
    return map
  }, [categories])

  const handleSelect = (details: unknown) => {
    if (!details || typeof details !== "object") return

    const rawValue = (details as { value?: unknown }).value
    const value =
      typeof rawValue === "string"
        ? rawValue
        : Array.isArray(rawValue) && typeof rawValue[0] === "string"
          ? rawValue[0]
          : null

    if (value === null) return

    const match = /^category:(\d+)$/.exec(value)
    if (!match) return

    const id = Number(match[1])
    const category = categoryById.get(id) ?? null

    setSelectedCategory(category)
    onSelect(category)
  }

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation() // Щоб не відкривалося меню при кліку на "хрестик"
    setSelectedCategory(null)
    onSelect(null)
  }

  const renderCategoryItems = (parentId: number | "root") => {
  const currentLevel = parentId === "root" ? categoriesByParent.root : categoriesByParent[parentId] || []

  return currentLevel.map((category) => {
    const hasChildren = !!categoriesByParent[category.id]

    if (hasChildren) {
      return (
        <Menu.Root 
          key={category.id} 
          positioning={{ placement: "right-start", gutter: 2 }}
          onSelect={handleSelect}
        >
          <Menu.TriggerItem 
            cursor="pointer"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            w="full"
          >
            <Text>{category.name}</Text>
            <LuChevronRight size="14px" />
          </Menu.TriggerItem>
          <Portal>
            <Menu.Positioner>
              <Menu.Content minW="200px" rounded="xl" boxShadow="lg" zIndex="popover">
                <Menu.Item 
                  value={`category:${category.id}`} 
                  fontWeight="bold" 
                >
                  Всі в "{category.name}"
                </Menu.Item>
                {renderCategoryItems(category.id)}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      )
    }

    return (
      <Menu.Item 
        key={category.id} 
        value={`category:${category.id}`}
      >
        {category.name}
      </Menu.Item>
    )})
  }

  return (
    <Menu.Root onSelect={handleSelect}>
      <Menu.Trigger asChild>
        <Button 
          variant="outline" 
          rounded="xl" 
          bg={selectedCategory ? "blue.50" : "gray.50"} 
          color={selectedCategory ? "blue.700" : "gray.700"}
          border={selectedCategory ? "1px solid" : "none"}
          borderColor="blue.200"
          _hover={{ bg: selectedCategory ? "blue.100" : "gray.100" }}
          px="4"
        >
          <HStack gap="2">
            <LuLayoutGrid />
            {/* Умова: якщо є категорія — пишемо ім'я, інакше дефолт */}
            <Text fontWeight={selectedCategory ? "bold" : "medium"}>
              {selectedCategory ? selectedCategory.name : "Категорії"}
            </Text>
            {/* Додаємо кнопку скидання, якщо категорія обрана */}
            {selectedCategory && (
              <Box as="span" onClick={handleReset} ml="1">
                <LuX size="14px" />
              </Box>
            )}
          </HStack>
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="220px" rounded="xl" boxShadow="xl" py="2" zIndex="popover">
            {renderCategoryItems("root")}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
