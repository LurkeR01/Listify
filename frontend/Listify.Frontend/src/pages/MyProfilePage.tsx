import { useAuth } from "@/auth/AuthContext"
import { useEffect, useState } from "react"
import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { footerGroups } from "@/data/home-content"
import {
  Box,
  Button,
  Container,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react"
import type { IconType } from "react-icons"
import {
  FiCalendar,
  FiEdit2,
  FiMail,
  FiMapPin,
  FiPhone,
  FiStar,
  FiTag,
  FiUser,
} from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import { getMyListings } from "@/api/listings"
import { getUserRatings } from "@/api/user"
import type { ListingDto } from "@/DTOs/Listing/ListingDto"
import { ListingStatus } from "@/data/home-content"

const formatRegisteredAt = (value: string | Date | undefined) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

const formatMemberSince = (value: string | Date | undefined) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  const normalized = date.toLocaleDateString("uk-UA", {
    month: "long",
    year: "numeric",
  })

  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

type ContactItemProps = {
  icon: IconType
  label: string
  value: string
}

function ContactItem({ icon, label, value }: ContactItemProps) {
  return (
    <HStack align="start" gap="3">
      <Box
        w="10"
        h="10"
        rounded="md"
        bg="gray.100"
        color="gray.600"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <Icon as={icon} boxSize="5" />
      </Box>

      <Stack gap="0.5">
        <Text fontSize="sm" color="gray.500">
          {label}
        </Text>
        <Text color="gray.800" fontWeight="medium">
          {value || "-"}
        </Text>
      </Stack>
    </HStack>
  )
}

export function MyProfilePage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim()
  const displayName = fullName || user?.username || "Користувач"
  const registeredAt = formatRegisteredAt(user?.registeredAt)
  const memberSince = formatMemberSince(user?.registeredAt)
  const locationLabel = user?.location
    ? [user.location.name, user.location.area].filter(Boolean).join(", ").trim()
    : "Не вказано"

  const [myListings, setMyListings] = useState<ListingDto[]>([])
  const [isLoadingMyListings, setIsLoadingMyListings] = useState(false)
  const [isLoadingRatings, setIsLoadingRatings] = useState(false)
  const [avgRating, setAvgRating] = useState<number | null>(null)

  useEffect(() => {
    if (!user?.id) return
    let mounted = true
    setIsLoadingMyListings(true)
    setIsLoadingRatings(true)

    getMyListings()
      .then((listingsRes) => {
        if (!mounted) return
        setMyListings(listingsRes)
      })
      .catch((err) => console.error(err))
      .finally(() => { if (mounted) setIsLoadingMyListings(false) })

    getUserRatings(user.id)
      .then((ratingsRes) => {
        if (!mounted) return
        const avg = ratingsRes.length > 0
          ? ratingsRes.reduce((s, r) => s + (typeof r.rating === 'number' ? r.rating : Number(r.rating)), 0) / ratingsRes.length
          : null
        setAvgRating(avg !== null ? Number(avg) : null)
      })
      .catch((err) => console.error(err))
      .finally(() => { if (mounted) setIsLoadingRatings(false) })

    return () => { mounted = false }
  }, [user?.id])

  if (!isAuthenticated) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
        <Header />
        <Box flex="1">
          <Container maxW="4xl" py={{ base: "8", md: "12" }}>
            <Box
              rounded="2xl"
              borderWidth="1px"
              borderColor="blue.100"
              bg="white"
              p={{ base: "5", md: "8" }}
              boxShadow="sm"
            >
              <Stack gap="4" textAlign="center" align="center">
                <Heading size={{ base: "md", md: "lg" }}>Профіль недоступний</Heading>
                <Text color="gray.600">Щоб переглянути сторінку профілю, увійдіть у свій акаунт.</Text>
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

  if (!user) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
        <Header />
        <Box flex="1">
          <Container maxW="5xl" py={{ base: "6", md: "10" }}>
            <Stack gap="6">
              <Box rounded="2xl" borderWidth="1px" borderColor="blue.100" bg="white" p={{ base: "5", md: "8" }} boxShadow="sm">
                <Stack gap="4">
                  <Skeleton height="8" width="44" />
                  <HStack gap="4" align="center">
                    <Skeleton boxSize={{ base: "20", md: "24" }} rounded="full" />
                    <Stack gap="3" flex="1">
                      <Skeleton height="6" width="56" maxW="100%" />
                      <Skeleton height="4" width="36" maxW="70%" />
                    </Stack>
                  </HStack>
                </Stack>
              </Box>

              <Box rounded="2xl" borderWidth="1px" borderColor="blue.100" bg="white" p={{ base: "5", md: "6" }} boxShadow="sm">
                <Stack gap="4">
                  <Skeleton height="6" width="48" />
                  <Skeleton height="14" rounded="lg" />
                  <Skeleton height="14" rounded="lg" />
                  <Skeleton height="14" rounded="lg" />
                </Stack>
              </Box>
            </Stack>
          </Container>
        </Box>
        <Footer groups={footerGroups} />
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      <Header />

      <Box flex="1">
        <Container maxW="5xl" py={{ base: "6", md: "10" }}>
          <Stack gap="6">
            <Box
              rounded="2xl"
              borderWidth="1px"
              borderColor="blue.100"
              bg="white"
              overflow="hidden"
              boxShadow="sm"
            >
              <Box
                h={{ base: "24", md: "32" }}
                bg="linear-gradient(135deg, #2563eb 0%, #3b82f6 45%, #60a5fa 100%)"
              />
              <Box px={{ base: "5", md: "8" }} pb={{ base: "5", md: "7" }}>
                <Stack
                  direction={{ base: "column", md: "row" }}
                  align={{ base: "start", md: "end" }}
                  justify="space-between"
                  gap={{ base: "4", md: "5" }}
                  mt={{ base: "-8", md: "-12" }}
                >
                  <Stack direction={{ base: "column", sm: "row" }} align={{ base: "start", sm: "end" }} gap="4">
                    <Box
                      w={{ base: "20", md: "28" }}
                      h={{ base: "20", md: "28" }}
                      rounded="full"
                      bg="white"
                      borderWidth="4px"
                      borderColor="white"
                      boxShadow="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      overflow="hidden"
                    >
                      {user?.avatarUrl ? (
                        <Image src={user.avatarUrl} alt={displayName} objectFit="cover" width="100%" height="100%" />
                      ) : (
                        <Icon as={FiUser} boxSize={{ base: "9", md: "14" }} color="gray.400" />
                      )}
                    </Box>

                    <Stack gap="1" pb={{ sm: "1" }}>
                      <Heading size={{ base: "md", md: "lg" }} color="gray.900">
                        {displayName}
                      </Heading>
                      <Text color="gray.600">Учасник з {memberSince}</Text>
                    </Stack>
                  </Stack>

                  <Button colorPalette="blue" variant="outline" rounded="lg" onClick={() => navigate("/profile/edit")}>
                    <Icon as={FiEdit2} />
                    Редагувати
                  </Button>
                </Stack>
              </Box>
            </Box>

            <Box
              rounded="2xl"
              borderWidth="1px"
              borderColor="blue.100"
              bg="white"
              p={{ base: "5", md: "6" }}
              boxShadow="sm"
            >
              <Stack gap="5">
                <Heading size="md">Контактна інформація</Heading>

                <Stack gap="4">
                  <ContactItem icon={FiMail} label="Email" value={user.email} />
                  <ContactItem icon={FiPhone} label="Телефон" value={user.phoneNumber} />
                  <ContactItem icon={FiMapPin} label="Локація" value={locationLabel} />
                  <ContactItem icon={FiCalendar} label="Дата реєстрації" value={registeredAt} />
                </Stack>
              </Stack>
            </Box>

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, minmax(0, 280px))" }} gap="4" justifyContent="center">
                <Box
                  rounded="xl"
                  borderWidth="1px"
                  borderColor="blue.100"
                  bg="white"
                  p="5"
                  boxShadow="sm"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                >
                  <Icon as={FiTag} boxSize="5" color="blue.600" />
                  {isLoadingMyListings ? (
                    <Skeleton height="6" width="20" />
                  ) : (
                    <Text mt="2" fontSize="3xl" fontWeight="bold" color="gray.900">
                      {(() => {
                        const count = myListings.filter((l) => l.status === ListingStatus.Published).length
                        return count > 0 ? String(count) : "-"
                      })()}
                    </Text>
                  )}
                  <Text color="gray.600">Активні оголошення</Text>
                </Box>

                <Box
                  rounded="xl"
                  borderWidth="1px"
                  borderColor="blue.100"
                  bg="white"
                  p="5"
                  boxShadow="sm"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                >
                  <Icon as={FiStar} boxSize="5" color="blue.600" />
                  {isLoadingRatings ? (
                    <Skeleton height="6" width="20" />
                  ) : (
                    <Text mt="2" fontSize="3xl" fontWeight="bold" color="gray.900">
                      {avgRating !== null && avgRating !== undefined ? avgRating.toFixed(1) : "-"}
                    </Text>
                  )}
                  <Text color="gray.600">Середній рейтинг</Text>
                </Box>
            </Grid>
          </Stack>
        </Container>
      </Box>

      <Footer groups={footerGroups} />
    </Box>
  )
}
