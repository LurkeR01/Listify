import {
  Box,
  Center,
  Container,
  Stack,
  Badge,
  HStack,
  Input,
  Flex,
  Heading,
  Spinner,
  Text,
  Dialog,
  Portal,
  Button,
  CloseButton,
} from "@chakra-ui/react"
import { useState, useMemo, useCallback, useEffect } from "react"
import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { footerGroups } from "@/data/home-content"
import { MyListingsList } from "@/components/my-listings"
import { getCategories } from "@/api/categories"
import type { CategoryDto } from "@/DTOs/Category/CategoryDto"
import { CategoryTreeMenu } from "@/components/my-listings/CategoryTreeMenu"
import { ListingSorting } from "@/components/listings/ListingSorting"
import { getListingsForUser } from "@/api/listings"
import type { ListingDto } from "@/DTOs/Listing/ListingDto"
import { ListingStatus } from "@/data/home-content"
import { toaster } from "@/components/ui/toaster"
import { deleteListing } from "@/api/listings"
import { toggleListingStatus } from "@/api/listings"

type ListingCountKey = "active" | "waiting" | "inactive"

const sortingOptions = ["По дате публикации", "По алфавиту", "Дешевле", "Дороже"] as const
type SortingOption = (typeof sortingOptions)[number]

export function MyListingsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ListingStatus>(ListingStatus.Published)
  const [searchText, setSearchText] = useState("")
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [listings, setListings] = useState<ListingDto[]>([])
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState<SortingOption>(sortingOptions[0])
  const [listingIdToDelete, setListingIdToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const [categories, listings] = await Promise.all([
          getCategories(),
          getListingsForUser()
        ])
        setCategories(categories)
        setListings(listings)
      } catch (error) {
        console.error("Error fetching my listings page data:", error)
        setLoadError("Не вдалося завантажити дані. Спробуйте оновити сторінку.")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

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
      const matchesSearch =
        normalizedSearch === "" ? true : listing.title.toLowerCase().includes(normalizedSearch)

      const matchesCategory =
        selectedCategoryId === null
          ? true
          : listing.categoryId !== undefined && (allowedCategoryIds?.has(listing.categoryId) ?? false)

      return matchesSearch && matchesCategory
    })
  }, [listings, activeTab, searchText, selectedCategory, allowedCategoryIds])

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


  const publishedListings = useMemo(() => sortedListings.filter((l) => l.status === ListingStatus.Published), [sortedListings])
  const draftedListings = useMemo(() => sortedListings.filter((l) => l.status === ListingStatus.Draft), [sortedListings])
  const archivedListings = useMemo(() => sortedListings.filter((l) => l.status === ListingStatus.Archived), [sortedListings])
  const listingCounts = {
    active: publishedListings.length,
    waiting: draftedListings.length,
    inactive: archivedListings.length,
  }

  const handleEdit = useCallback((id: string) => {
    navigate(`/my-listings/${id}/edit`)
  }, [navigate])

  const handleDelete = useCallback((id: string) => {
    setListingIdToDelete(id);
  }, [])


  const confirmDelete = async () => {
    if (!listingIdToDelete) return;

    setIsDeleting(true);
    try {
      await deleteListing(listingIdToDelete);

      // Оновлюємо дані локально: прибираємо видалений елемент зі списку
      setListings((prev) => prev.filter((item) => item.id !== listingIdToDelete));

      toaster.create({
        title: "Оголошення видалено",
        type: "success",
      });
    } catch (error: any) {
      toaster.create({
        title: "Помилка",
        description: error.response?.data?.message || "Не вдалося видалити оголошення",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
      setListingIdToDelete(null);
    }
  };

  const handleToggleStatus = useCallback(
  async (id: string, status: ListingStatus) => {
    try {
      await toggleListingStatus(id, { status });

      setListings((prevListings) =>
        prevListings.map((listing) =>
          listing.id === id 
            ? { ...listing, status: status } // Створюємо копію лістингу з новим статусом
            : listing
        )
      );

      toaster.create({
        title: "Статус змінено",
        type: "success",
      });
    } catch (error: any) {
      toaster.create({
        title: "Помилка",
        description: error.response?.data?.message || "Не вдалося змінити статус оголошення",
        type: "error",
      });
    }
  },
  []
);

  const statusConfig = {
    [ListingStatus.Published]: { label: "Активні", key: "active" },
    [ListingStatus.Draft]: { label: "Очікують", key: "waiting" },
    [ListingStatus.Archived]: { label: "Неактивні", key: "inactive" },
  } as const satisfies Record<ListingStatus, { label: string; key: ListingCountKey }>

  const statusTabs = [ListingStatus.Published, ListingStatus.Draft, ListingStatus.Archived] as const

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />

      <Container maxW="7xl" py="8">
        <Stack gap="8" aria-busy={isLoading}>
          <Flex justify="space-between" align="flex-end">
            <Stack gap="1">
              <Heading size="xl" fontWeight="bold" color="gray.900">
                Мої оголошення
              </Heading>
              <Text color="gray.500">
                Керуйте вашими пропозиціями та відстежуйте статистику
              </Text>
            </Stack>
          </Flex>

          {/* Tabs & Controls Card */}
          <Box
            bg="white"
            p="5"
            rounded="2xl"
            borderWidth="1px"
            borderColor="gray.200"
            boxShadow="sm"
          >
            <Stack gap="6">
              <HStack gap="8" borderBottomWidth="1px" borderColor="gray.100" pb="0">
                {statusTabs.map((statusValue) => {
                  const config = statusConfig[statusValue]
                  const isActive = activeTab === statusValue

                  return (
                    <Box
                      key={statusValue}
                      as="button"
                      onClick={() => setActiveTab(statusValue)}
                      pb="4"
                      position="relative"
                      color={isActive ? "blue.600" : "gray.500"}
                      fontWeight="semibold"
                      transition="all 0.2s"
                      _hover={{ color: "blue.500" }}
                    >
                      <Text as="span">{config.label}</Text>
                      
                      <Badge 
                        ms="2" 
                        variant="subtle" 
                        colorPalette={isActive ? "blue" : "gray"} 
                      >
                        {listingCounts[config.key]} 
                      </Badge>

                      {isActive && (
                        <Box
                          position="absolute"
                          bottom="0"
                          left="0"
                          right="0"
                          h="2px"
                          bg="blue.600"
                        />
                      )}
                    </Box>
                  )
                })}
              </HStack>

              {/* Filters & Search */}
              <Flex gap="4" direction={{ base: "column", md: "row" }}>
                <Box position="relative" flex="1">
                  <Box
                    position="absolute"
                    left="3"
                    top="50%"
                    transform="translateY(-50%)"
                    color="gray.400"
                  >
                    <Search size={18} />
                  </Box>
                  <Input
                    placeholder="Пошук за назвою..."
                    ps="10"
                    rounded="xl"
                    bg="gray.50"
                    border="none"
                    _focus={{ bg: "white", boxShadow: "outline" }}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Box>
                <HStack gap="4" w={{ base: "full", md: "auto" }}>
                  <CategoryTreeMenu
                    categories={categories}
                    onSelect={(category) => setSelectedCategory(category)}
                  />
                  <ListingSorting
                    options={[...sortingOptions]}
                    value={sortOption}
                    onChange={(value) => {
                      if ((sortingOptions as readonly string[]).includes(value)) {
                        setSortOption(value as SortingOption)
                      }
                    }}
                  />

                </HStack>
              </Flex>
            </Stack>
          </Box>

          {loadError ? (
            <Box
              bg="white"
              p="6"
              rounded="2xl"
              borderWidth="1px"
              borderColor="red.200"
            >
              <Text color="red.600" fontWeight="medium">
                {loadError}
              </Text>
            </Box>
          ) : isLoading ? (
            <Center
              bg="white"
              rounded="2xl"
              borderWidth="1px"
              borderColor="gray.200"
              py="16"
              flexDirection="column"
              gap="3"
            >
              <Spinner size="lg" color="blue.600" />
              <Text color="gray.500">Завантаження оголошень...</Text>
            </Center>
          ) : (
            <MyListingsList
              listings={activeTab === ListingStatus.Published
                        ? publishedListings
                        : activeTab === ListingStatus.Draft
                          ? draftedListings
                          : activeTab === ListingStatus.Archived
                            ? archivedListings
                            : []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </Stack>

      <Dialog.Root 
        open={!!listingIdToDelete} 
        placement="center"
        onOpenChange={(e) => !e.open && setListingIdToDelete(null)}
        role="alertdialog"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content rounded="2xl" p="4">
              <Dialog.CloseTrigger asChild>
                <CloseButton />
              </Dialog.CloseTrigger>
              <Dialog.Header>
                <Dialog.Title fontWeight="bold">Підтвердження видалення</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body color="gray.600">
                <Text>
                  Ви впевнені, що хочете видалити це оголошення?
                </Text>
              </Dialog.Body>

              <Dialog.Footer gap="3">
                <Button 
                variant="ghost" 
                rounded="xl"
                onClick={() => setListingIdToDelete(null)}>
                  Скасувати
                </Button>                
                <Button 
                  colorPalette="red" 
                  rounded="xl" 
                  loading={isDeleting}
                  onClick={confirmDelete}
                >
                  Видалити
                </Button>
              </Dialog.Footer>
            </Dialog.Content>`

          </Dialog.Positioner>

        </Portal>
      </Dialog.Root>
      </Container>
      <Footer groups={footerGroups} />
    </Box>
  )
}
