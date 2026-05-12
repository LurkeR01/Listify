import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getUserById, getUserRatings } from "@/api/user"
import { getListingsForUser } from "@/api/listings"
import type { ResponseUserDto, UserRatingDto } from "@/DTOs/User/UserDto"
import {
  Box,
  Container,
  Flex,
  Stack,
  HStack,
  Text,
  Heading,
  Button,
  Tabs,
  Input,
  Avatar,
  Center,
  Spinner,
} from "@chakra-ui/react"
import { Search, Star, Calendar, Phone } from "lucide-react"
import { ListingItemCard } from "@/components/my-listings/ListingItemCard"
import type { ListingDto } from "@/DTOs/Listing/ListingDto"
import { useListingsFilterSort } from "@/hooks/useListingsFilterSort"
import { ListingStatus, footerGroups } from "@/data/home-content"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { CategoryTreeMenu } from "@/components/my-listings/CategoryTreeMenu"
import { ListingSorting } from "@/components/listings/ListingSorting"
import type { CategoryDto } from "@/DTOs/Category/CategoryDto"
import { getCategories } from "@/api/categories"

// Using ListingStatus from shared data/home-content

// Listings will be loaded from API

// --- Допоміжні компоненти ---
const RatingStars = ({ val }: { val: number }) => (
  <HStack gap="1">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={14} fill={s <= val ? "#EAB308" : "none"} color={s <= val ? "#EAB308" : "#CBD5E1"} />
    ))}
  </HStack>
)

const sortingOptions = ["По дате публикации", "По алфавиту", "Дешевле", "Дороже"] as const
type SortingOption = (typeof sortingOptions)[number]

export function UserProfilePage() {
  const [showPhone, setShowPhone] = useState(false)
  const [searchText, setSearchText] = useState("")
  const { id } = useParams()
  const userId = id ?? ""
  const [apiUser, setApiUser] = useState<ResponseUserDto | null>(null)
  const [listings, setListings] = useState<ListingDto[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(false)
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(null)
  const [sortOption, setSortOption] = useState<SortingOption>(sortingOptions[0])
  const [ratings, setRatings] = useState<UserRatingDto[]>([])
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [isLoadingRatings, setIsLoadingRatings] = useState(false)

  useEffect(() => {
    if (!userId) return
    let mounted = true
    getUserById(userId)
      .then((data) => {
        if (mounted) setApiUser(data)
      })
      .catch((err) => console.error(err))
    return () => {
      mounted = false
    }
  }, [userId])

  useEffect(() => {
    let mounted = true
    async function loadListings() {
      try {
        setIsLoadingListings(true)
        const [categories, listings] = await Promise.all([
          getCategories(),
          getListingsForUser(userId)
        ])
        if (!mounted) return
        setCategories(categories)
        setListings(listings)
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setIsLoadingListings(false)
      }
    }

    loadListings()

    return () => {
      mounted = false
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return
    let mounted = true
    setIsLoadingRatings(true)
    getUserRatings(userId)
      .then((userRatings) => {
        if (!mounted) return
        setRatings(userRatings)
        const avg = userRatings.length > 0
          ? userRatings.reduce((s, r) => s + (typeof r.rating === "number" ? r.rating : Number(r.rating)), 0) / userRatings.length
          : null
        setAvgRating(avg !== null ? Number(avg) : null)
      })
      .catch((err) => console.error(err))
      .finally(() => { if (mounted) setIsLoadingRatings(false) })

    return () => { mounted = false }
  }, [userId])

  const { sortedListings } = useListingsFilterSort({
    listings,
    categories,
    searchText,
    selectedCategory,
    sortOption,
  })

  const displayName = apiUser ? ([apiUser.firstName, apiUser.lastName].filter(Boolean).join(" ").trim() || apiUser.username || "Користувач") : "Користувач"
  const avatar = apiUser?.avatarUrl ?? undefined
  const registeredAtRaw = apiUser?.registeredAt ?? ""
  const registeredAtFormatted = (() => {
    try {
      const d = new Date(registeredAtRaw)
      if (!isNaN(d.getTime())) {
        return d.toLocaleString("uk", { month: "long", year: "numeric" })
      }
    } catch {}
    return String(registeredAtRaw)
  })()

  const totalRatings = ratings.length
  const distribution = [5, 4, 3, 2, 1].map((num) => {
    const count = ratings.filter((r) => Math.round(r.rating) === num).length
    const pct = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0
    return { num, count, pct }
  })

  const formatDate = (iso?: string) => {
    try {
      if (!iso) return ""
      const d = new Date(iso)
      if (!isNaN(d.getTime())) return d.toLocaleDateString("uk", { day: "2-digit", month: "2-digit", year: "numeric" })
    } catch {}
    return String(iso ?? "")
  }

  return (
    <Box bg="gray.50" minH="100vh">
      <Header />
      <Container maxW="6xl" py="8">
        {/* --- Header: User Info --- */}
        <Box bg="white" p="6" rounded="3xl" shadow="sm" borderWidth="1px" borderColor="gray.100" mb="8">
          <Flex justify="space-between" align="center" direction={{ base: "column", md: "row" }} gap="6">
            <HStack gap="6">
              <Avatar.Root size="2xl" border="4px solid white" shadow="md">
                <Avatar.Image src={avatar} />
                <Avatar.Fallback name={displayName} />
              </Avatar.Root>
              <Stack gap="1">
                <Heading size="xl" color="gray.900">{displayName}</Heading>
                <HStack gap="4">
                  <HStack gap="1">
                    <Star size={18} fill="#EAB308" color="#EAB308" />
                    {isLoadingRatings ? (
                      <Spinner size="xs" />
                    ) : (
                      <Text fontWeight="bold">{avgRating !== null && avgRating !== undefined ? avgRating.toFixed(1) : "—"}</Text>
                    )}
                    <Text color="gray.500">({totalRatings} відгуків)</Text>
                  </HStack>
                  <HStack gap="1" color="gray.500" fontSize="sm">
                    <Calendar size={16} />
                    <Text>На сайті з {registeredAtFormatted}</Text>
                  </HStack>
                </HStack>
              </Stack>
            </HStack>
            
            <Button 
              size="xl" 
              colorPalette="blue" 
              rounded="2xl" 
              px="10" 
              onClick={() => setShowPhone(!showPhone)}
            >
              <Phone size={18} />
              {showPhone ? (apiUser?.phoneNumber ? `+38${apiUser.phoneNumber}` : "Телефон недоступний") : "Показати телефон"}
            </Button>
          </Flex>
        </Box>

        {/* --- Tabs Section --- */}
        <Tabs.Root defaultValue="listings" variant="enclosed" colorPalette="blue">
          <Tabs.List bg="gray.100" p="1" rounded="2xl" mb="6" border="none">
            <Tabs.Trigger value="listings" rounded="xl" flex="1" fontWeight="bold">
              Оголошення
            </Tabs.Trigger>
            <Tabs.Trigger value="reviews" rounded="xl" flex="1" fontWeight="bold">
              Рейтинги
            </Tabs.Trigger>
            <Tabs.Trigger value="about" rounded="xl" flex="1" fontWeight="bold">
              Про нас
            </Tabs.Trigger>
          </Tabs.List>

          {/* --- Tab 1: Listings --- */}
          <Tabs.Content value="listings">
            <Stack gap="6">
              {/* Filter Bar */}
              <Flex gap="4" direction={{ base: "column", md: "row" }}>
                <Box position="relative" flex="1">
                  <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" color="gray.400" zIndex="10">
                    <Search size={18} />
                  </Box>
                  <Input
                    placeholder="Пошук за назвою..."
                    ps="10"
                    rounded="xl"
                    bg="white"
                    borderWidth="1px"
                    borderColor="gray.200"
                    _focus={{ borderColor: "blue.500", boxShadow: "none" }}
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

              {/* Listings Grid */}
              <Stack gap="4">
                {isLoadingListings ? (
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
                  (() => {
                    const publishedListings = sortedListings.filter((l) => l.status === ListingStatus.Published)
                    if (publishedListings.length === 0) {
                      return (
                        <Box bg="white" p="6" rounded="2xl" borderWidth="1px" borderColor="gray.100">
                          <Text color="gray.600">У цього користувача немає опублікованих оголошень.</Text>
                        </Box>
                      )
                    }

                    return publishedListings.map((listing) => (
                      <ListingItemCard key={listing.id} listing={listing} onEdit={null} onDelete={null} onToggleStatus={null} />
                    ))
                  })()
                )}
              </Stack>
            </Stack>
          </Tabs.Content>

          {/* --- Tab 2: Reviews --- */}
          <Tabs.Content value="reviews">
            <Flex gap="8" direction={{ base: "column", lg: "row" }}>
              {/* Rating Stats */}
              <Box bg="white" p="6" rounded="3xl" w={{ lg: "300px" }} h="fit-content" shadow="sm">
                 <Stack align="center" gap="2" mb="4">
                   {isLoadingRatings ? (
                     <Spinner size="lg" color="blue.600" />
                   ) : (
                     <Text fontSize="5xl" fontWeight="black" color="blue.600">{avgRating !== null && avgRating !== undefined ? avgRating.toFixed(1) : "—"}</Text>
                   )}
                   <RatingStars val={avgRating ? Math.round(avgRating) : 0} />
                   <Text color="gray.500" fontSize="sm">Середня оцінка</Text>
                 </Stack>
                 <Stack gap="3">
                   {distribution.map(d => (
                     <HStack key={d.num} justify="space-between">
                       <Text fontSize="sm" fontWeight="medium">{d.num} зірок</Text>
                       <Box flex="1" h="2" bg="gray.100" rounded="full" mx="3">
                          <Box h="full" bg="yellow.400" rounded="full" w={`${d.pct}%`} />
                       </Box>
                       <Text fontSize="xs" color="gray.400">{d.count}</Text>
                     </HStack>
                   ))}
                 </Stack>
              </Box>

              {/* Reviews List */}
              <Stack flex="1" gap="4">
                {ratings.length === 0 ? (
                  <Box bg="white" p="6" rounded="2xl" borderWidth="1px" borderColor="gray.100">
                    <Text color="gray.600">У цього користувача немає відгуків.</Text>
                  </Box>
                ) : (
                  ratings.map((rating) => {
                    const listing = listings.find(l => l.id === rating.listingId)
                    return (
                      <Box key={rating.id} bg="white" p="5" rounded="2xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
                        <Flex justify="space-between" mb="3">
                          <Stack gap="0">
                            <Text fontWeight="bold" fontSize="lg">{listing?.title ?? rating.listingId}</Text>
                            <RatingStars val={rating.rating} />
                          </Stack>
                          <Text color="gray.400" fontSize="sm">{formatDate(rating.createdAt)}</Text>
                        </Flex>
                        <Text color="gray.700" mb="3">{rating.comment}</Text>
                        <HStack color="gray.500" fontSize="xs">
                          <Text>Від: <Text as="span" fontWeight="bold" color="gray.900">{rating.fromUser?.firstName ?? "Користувач"}</Text></Text>
                        </HStack>
                      </Box>
                    )
                  })
                )}
              </Stack>
            </Flex>
          </Tabs.Content>

          {/* --- Tab 3: About --- */}
          <Tabs.Content value="about">
            <Box bg="white" p="8" rounded="3xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
               <Heading size="md" mb="4">Про продавця</Heading>
               <Text color="gray.700" lineHeight="tall">
                 {(apiUser as any)?.about ?? "Про продавця інформації немає."}
               </Text>
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Container>
      <Footer groups={footerGroups} />
    </Box>
  )
}

