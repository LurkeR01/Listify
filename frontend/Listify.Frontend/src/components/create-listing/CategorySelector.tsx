import {
  Button,
  Dialog,
  Grid,
  HStack,
  Icon,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi"
import type { CategoryDto } from "@/DTOs/Category/CategoryDto"
import { useCategoryTree } from "@/hooks/useCategoryTree"

type CategorySelectorProps = {
  categories: CategoryDto[]
  selectedCategory: CategoryDto | null
  isLoading: boolean
  onSelectCategory: (category: CategoryDto) => void
}

export function CategorySelector({
  categories,
  selectedCategory,
  isLoading,
  onSelectCategory,
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const {
    categoryPath,
    setCategoryPath,
    selectedCategoryLabel,
    categoryColumns,
    selectCategoryAtColumn,
    syncPathFromSelection,
  } = useCategoryTree({
    categories,
    selectedCategory,
  })

  useEffect(() => {
    if (!isOpen) return
    syncPathFromSelection()
  }, [isOpen, syncPathFromSelection])

  return (
    <Stack gap="2">
      <Text fontSize="sm" color="gray.700">
        Категорія
      </Text>
      <Dialog.Root open={isOpen} onOpenChange={(details) => setIsOpen(details.open)}>
        <Dialog.Trigger asChild>
          <Button
            variant="outline"
            justifyContent="space-between"
            color={selectedCategory ? "gray.900" : "gray.500"}
          >
            {selectedCategory ? selectedCategoryLabel : "Обрати категорію"}
            <Icon as={FiChevronRight} />
          </Button>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content
              maxW="5xl"
              w="full"
              bg="white"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="blue.100"
              overflow="hidden"
            >
              <Dialog.Header
                p="4"
                borderBottomWidth="1px"
                borderColor="blue.100"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack gap="1">
                  <Dialog.Title fontSize="lg" fontWeight="semibold">
                    Оберіть категорію
                  </Dialog.Title>
                  <Dialog.Description fontSize="sm" color="gray.600">
                    Відкривайте підкатегорії, доки не знайдете потрібну.
                  </Dialog.Description>
                </Stack>
                <Dialog.CloseTrigger
                  aria-label="Закрити"
                  rounded="full"
                  p="2"
                  _hover={{ bg: "gray.100" }}
                >
                  <Icon as={FiX} />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body p="4">
                <Stack gap="4">
                  <HStack>
                    {categoryPath.length > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        color="gray.600"
                        onClick={() => setCategoryPath((prev) => prev.slice(0, -1))}
                      >
                        <Icon as={FiChevronLeft} />
                        Назад
                      </Button>
                    )}
                    <Text fontSize="sm" color="gray.600">
                      {categoryPath.length === 0
                        ? "Головні категорії"
                        : categoryPath.map((item) => item.name).join(" / ")}
                    </Text>
                  </HStack>

                  {isLoading ? (
                    <Text color="gray.600">Завантажуємо категорії…</Text>
                  ) : (
                    <Grid
                      templateColumns={{
                        base: "1fr",
                        md: `repeat(${categoryColumns.length}, minmax(0, 1fr))`,
                      }}
                      gap="4"
                    >
                      {categoryColumns.map((column, columnIndex) => (
                        <Stack
                          key={`column-${columnIndex}`}
                          gap="2"
                          borderWidth="1px"
                          borderColor="blue.100"
                          rounded="xl"
                          p="3"
                          minH="240px"
                        >
                          {column.length === 0 ? (
                            <Text fontSize="sm" color="gray.500">
                              Немає підкатегорій
                            </Text>
                          ) : (
                            column.map((item) => {
                              const hasChildren = categories.some((category) => category.parentId === item.id)
                              const isActive = categoryPath[columnIndex]?.id === item.id

                              return (
                                <Button
                                  key={item.id}
                                  size="sm"
                                  variant={isActive ? "subtle" : "ghost"}
                                  justifyContent="space-between"
                                  onClick={() => {
                                    const selectedLeaf = selectCategoryAtColumn(item, columnIndex)
                                    if (!selectedLeaf) return
                                    onSelectCategory(selectedLeaf)
                                    setIsOpen(false)
                                  }}
                                >
                                  {item.name}
                                  {hasChildren ? <Icon as={FiChevronRight} /> : null}
                                </Button>
                              )
                            })
                          )}
                        </Stack>
                      ))}
                    </Grid>
                  )}
                </Stack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
      {selectedCategory ? (
        <Text fontSize="xs" color="gray.500">
          Обрана категорія: {selectedCategoryLabel}
        </Text>
      ) : null}
    </Stack>
  )
}
