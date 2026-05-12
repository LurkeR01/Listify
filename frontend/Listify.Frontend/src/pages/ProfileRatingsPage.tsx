import { getMyListings } from "@/api/listings"
import { getUserRatings } from "@/api/user"
import { useAuth } from "@/auth/AuthContext"
import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import type { ListingDto } from "@/DTOs/Listing/ListingDto"
import type { UserRatingDto } from "@/DTOs/User/UserDto"
import { footerGroups } from "@/data/home-content"
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  HStack,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react"
import { Star } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const RatingStars = ({ val }: { val: number }) => (
  <HStack gap="1">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={14} fill={s <= val ? "#EAB308" : "none"} color={s <= val ? "#EAB308" : "#CBD5E1"} />
    ))}
  </HStack>
)

const formatDate = (iso?: string) => {
  try {
    if (!iso) return ""
    const d = new Date(iso)
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("uk", { day: "2-digit", month: "2-digit", year: "numeric" })
    }
  } catch {}

  return String(iso ?? "")
}

export function ProfileRatingsPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [ratings, setRatings] = useState<UserRatingDto[]>([])
  const [listings, setListings] = useState<ListingDto[]>([])
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [isLoadingRatings, setIsLoadingRatings] = useState(false)

  useEffect(() => {
    if (!user?.id) return

    let mounted = true
    setIsLoadingRatings(true)

    Promise.all([getUserRatings(user.id), getMyListings()])
      .then(([userRatings, userListings]) => {
        if (!mounted) return

        setRatings(userRatings)
        setListings(userListings)

        const avg =
          userRatings.length > 0
            ? userRatings.reduce((sum, rating) => sum + Number(rating.rating), 0) / userRatings.length
            : null

        setAvgRating(avg !== null ? Number(avg) : null)
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setIsLoadingRatings(false)
      })

    return () => {
      mounted = false
    }
  }, [user?.id])

  const totalRatings = ratings.length
  const distribution = [5, 4, 3, 2, 1].map((num) => {
    const count = ratings.filter((rating) => Math.round(rating.rating) === num).length
    const pct = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0

    return { num, count, pct }
  })

  if (!isAuthenticated) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
        <Header />
        <Box flex="1">
          <Container maxW="4xl" py={{ base: "8", md: "12" }}>
            <Box rounded="2xl" borderWidth="1px" borderColor="blue.100" bg="white" p={{ base: "5", md: "8" }} boxShadow="sm">
              <Stack gap="4" textAlign="center" align="center">
                <Heading size={{ base: "md", md: "lg" }}>Рейтинги недоступні</Heading>
                <Text color="gray.600">Щоб переглянути свої відгуки та оцінки, увійдіть у свій акаунт.</Text>
                <Button colorPalette="blue" onClick={() => navigate("/auth")}>
                  Увійти
                </Button>
              </Stack>
            </Box>
          </Container>
        </Box>
        <Footer groups={footerGroups} />
      </Box>
    )
  }

  return (
    <Box bg="gray.50" minH="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex="1">
        <Container maxW="6xl" py="8">
          <Stack gap="6">
            <Box bg="white" p={{ base: "5", md: "6" }} rounded="3xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
              <Stack gap="2">
                <Heading size="xl" color="gray.900">
                  Рейтинги
                </Heading>
                <Text color="gray.600">Відгуки та оцінки, які залишили покупці після ваших оголошень.</Text>
              </Stack>
            </Box>

            <Flex gap="8" direction={{ base: "column", lg: "row" }}>
              <Box bg="white" p="6" rounded="3xl" w={{ lg: "300px" }} h="fit-content" shadow="sm">
                <Stack align="center" gap="2" mb="4">
                  {isLoadingRatings ? (
                    <Spinner size="lg" color="blue.600" />
                  ) : (
                    <Text fontSize="5xl" fontWeight="black" color="blue.600">
                      {avgRating !== null && avgRating !== undefined ? avgRating.toFixed(1) : "-"}
                    </Text>
                  )}
                  <RatingStars val={avgRating ? Math.round(avgRating) : 0} />
                  <Text color="gray.500" fontSize="sm">
                    Середня оцінка
                  </Text>
                </Stack>

                <Stack gap="3">
                  {distribution.map((item) => (
                    <HStack key={item.num} justify="space-between">
                      <Text fontSize="sm" fontWeight="medium">
                        {item.num} зірок
                      </Text>
                      <Box flex="1" h="2" bg="gray.100" rounded="full" mx="3">
                        <Box h="full" bg="yellow.400" rounded="full" w={`${item.pct}%`} />
                      </Box>
                      <Text fontSize="xs" color="gray.400">
                        {item.count}
                      </Text>
                    </HStack>
                  ))}
                </Stack>
              </Box>

              <Stack flex="1" gap="4">
                {isLoadingRatings ? (
                  <Center bg="white" rounded="2xl" borderWidth="1px" borderColor="gray.100" py="16" flexDirection="column" gap="3">
                    <Spinner size="lg" color="blue.600" />
                    <Text color="gray.500">Завантаження відгуків...</Text>
                  </Center>
                ) : ratings.length === 0 ? (
                  <Box bg="white" p="6" rounded="2xl" borderWidth="1px" borderColor="gray.100">
                    <Text color="gray.600">У вас поки що немає відгуків.</Text>
                  </Box>
                ) : (
                  ratings.map((rating) => {
                    const listing = listings.find((item) => item.id === rating.listingId)

                    return (
                      <Box key={rating.id} bg="white" p="5" rounded="2xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
                        <Flex justify="space-between" mb="3" gap="4">
                          <Stack gap="0">
                            <Text fontWeight="bold" fontSize="lg">
                              {listing?.title ?? rating.listingId}
                            </Text>
                            <RatingStars val={rating.rating} />
                          </Stack>
                          <Text color="gray.400" fontSize="sm" flexShrink={0}>
                            {formatDate(rating.createdAt)}
                          </Text>
                        </Flex>
                        <Text color="gray.700" mb="3">
                          {rating.comment}
                        </Text>
                        <HStack color="gray.500" fontSize="xs">
                          <Text>
                            Від:{" "}
                            <Text as="span" fontWeight="bold" color="gray.900">
                              {rating.fromUser?.firstName ?? "Користувач"}
                            </Text>
                          </Text>
                        </HStack>
                      </Box>
                    )
                  })
                )}
              </Stack>
            </Flex>
          </Stack>
        </Container>
      </Box>
      <Footer groups={footerGroups} />
    </Box>
  )
}
