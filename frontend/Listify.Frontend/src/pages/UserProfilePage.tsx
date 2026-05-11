import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getUserById } from "@/api/user"
import { getListingsForUser } from "@/api/listings"
import type { ResponseUserDto } from "@/DTOs/User/UserDto"
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

// --- Філлерні дані ---
// Using ListingStatus from shared data/home-content

const mockUser = {
  name: "Олександр Коваленко",
  avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop",
  rating: 4.8,
  reviewsCount: 24,
  registeredAt: "березень 2022",
  phone: "+380 67 123 45 67",
  about: "Займаюся продажем якісної техніки вже понад 3 роки. Всі товари проходять перевірку перед відправкою. Завжди радий відповісти на ваші запитання!"
}

// Listings will be loaded from API

const mockReviews = [
  { id: 1, itemName: "iPhone 15 Pro Max", rating: 5, user: "Ігор В.", date: "12.04.2024", comment: "Все супер, продавець пунктуальний." },
  { id: 2, itemName: "AirPods Pro 2", rating: 4, user: "Олена М.", date: "05.04.2024", comment: "Товар відповідає опису." }
]

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

  const { sortedListings } = useListingsFilterSort({
    listings,
    categories,
    searchText,
    selectedCategory,
    sortOption,
  })

  const displayName = apiUser ? [apiUser.firstName, apiUser.lastName].filter(Boolean).join(" ").trim() || apiUser.username || mockUser.name : mockUser.name
  const avatar = apiUser?.avatarUrl ?? mockUser.avatar
  const registeredAtRaw = apiUser?.registeredAt ?? mockUser.registeredAt
  const registeredAtFormatted = (() => {
    try {
      const d = new Date(registeredAtRaw)
      if (!isNaN(d.getTime())) {
        return d.toLocaleString("uk", { month: "long", year: "numeric" })
      }
    } catch {}
    return String(registeredAtRaw)
  })()

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
                    <Text fontWeight="bold">{mockUser.rating}</Text>
                    <Text color="gray.500">({mockUser.reviewsCount} відгуків)</Text>
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
              {showPhone ? "+38" + apiUser?.phoneNumber : "Показати телефон"}
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
                   <Text fontSize="5xl" fontWeight="black" color="blue.600">{mockUser.rating}</Text>
                   <RatingStars val={5} />
                   <Text color="gray.500" fontSize="sm">Середня оцінка</Text>
                 </Stack>
                 <Stack gap="3">
                   {[5, 4, 3, 2, 1].map(num => (
                     <HStack key={num} justify="space-between">
                       <Text fontSize="sm" fontWeight="medium">{num} зірок</Text>
                       <Box flex="1" h="2" bg="gray.100" rounded="full" mx="3">
                          <Box h="full" bg="yellow.400" rounded="full" w={num === 5 ? "80%" : "10%"} />
                       </Box>
                       <Text fontSize="xs" color="gray.400">{num === 5 ? "20" : "1"}</Text>
                     </HStack>
                   ))}
                 </Stack>
              </Box>

              {/* Reviews List */}
              <Stack flex="1" gap="4">
                {mockReviews.map(review => (
                  <Box key={review.id} bg="white" p="5" rounded="2xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
                    <Flex justify="space-between" mb="3">
                      <Stack gap="0">
                        <Text fontWeight="bold" fontSize="lg">{review.itemName}</Text>
                        <RatingStars val={review.rating} />
                      </Stack>
                      <Text color="gray.400" fontSize="sm">{review.date}</Text>
                    </Flex>
                    <Text color="gray.700" mb="3">{review.comment}</Text>
                    <HStack color="gray.500" fontSize="xs">
                      <Text>Від: <Text as="span" fontWeight="bold" color="gray.900">{review.user}</Text></Text>
                    </HStack>
                  </Box>
                ))}
              </Stack>
            </Flex>
          </Tabs.Content>

          {/* --- Tab 3: About --- */}
          <Tabs.Content value="about">
            <Box bg="white" p="8" rounded="3xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
               <Heading size="md" mb="4">Про продавця</Heading>
               <Text color="gray.700" lineHeight="tall">
                 {mockUser.about}
               </Text>
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Container>
      <Footer groups={footerGroups} />
    </Box>
  )
}

