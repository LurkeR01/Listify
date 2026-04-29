import {
  Box,
  Button,
  Center,
  Container,
  Grid,
  Heading,
  Icon,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react"
import {
  LuChevronLeft,
} from "react-icons/lu"
import { useEffect, useState } from "react"
import type { ListingDetailDto } from "@/DTOs/Listing/ListingDetailDto"
import { useNavigate, useParams } from "react-router-dom"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { footerGroups } from "@/data/home-content"
import { ListingSummaryCard } from "@/components/listings/ListingSummaryCard"
import { ListingDescriptionCard } from "@/components/listings/ListingDescriptionCard"
import { ListingDetailsCard } from "@/components/listings/ListingDetailsCard"
import { ListingSellerCard } from "@/components/listings/ListingSellerCard"
import { ListingImageGallery } from "@/components/listings/ListingImageGallery"
import { getListingById } from "@/api/listings"


export function ListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const listingId = id ?? ""
  const hasValidId = listingId.trim().length > 0
  const [listing, setListing] = useState<ListingDetailDto>()
  const [isLoading, setIsLoading] = useState(false)
  const fallbackCategoryId = listing?.Category.id ?? 1
  
  
  useEffect(() => {
    if (!hasValidId) {
      setListing(undefined)
      return
    }

    async function loadData() {
      try {
        setIsLoading(true)
        const data = await getListingById(listingId)
        setListing(data)
      } catch (error) {
        console.error(error)
        setListing(undefined)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [listingId, hasValidId])

  if (!hasValidId) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Center py={{ base: "16", md: "24" }}>
          <Stack gap="4" textAlign="center">
            <Heading size="lg">Оголошення не знайдено</Heading>
            <Text color="gray.600">
              Посилання містить некоректний ідентифікатор.
            </Text>
            <Button onClick={() => navigate(`/listings/${fallbackCategoryId}`)} colorPalette="blue">
              До оголошень
            </Button>
          </Stack>
        </Center>
        <Footer groups={footerGroups} />
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Center py={{ base: "16", md: "24" }}>
          <Stack gap="4" textAlign="center">
            <Spinner size="lg" color="blue.500" />
            <Text color="gray.600">Завантажуємо оголошення…</Text>
          </Stack>
        </Center>
        <Footer groups={footerGroups} />
      </Box>
    )
  }

  if (!listing) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Center py={{ base: "16", md: "24" }}>
          <Stack gap="4" textAlign="center">
            <Heading size="lg">Оголошення не знайдено</Heading>
            <Text color="gray.600">
              Перевірте посилання або поверніться до списку.
            </Text>
            <Button onClick={() => navigate(`/listings/${fallbackCategoryId}`)} colorPalette="blue">
              До оголошень
            </Button>
          </Stack>
        </Center>
        <Footer groups={footerGroups} />
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />

      <Container maxW="9xl" py={{ base: "6", md: "8" }}>
        <Stack gap="6">
          <Button
            onClick={() => navigate(`/listings/${listing.Category.id}`)}
            variant="ghost"
            color="gray.600"
            px="0"
            height="auto"
            minW="auto"
            justifyContent="flex-start"
            gap="2"
            _hover={{ color: "gray.900", bg: "transparent" }}
          >
            <Icon as={LuChevronLeft} boxSize="4" />
            Назад до оголошень
          </Button>

          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="8" alignItems="start">
            <Stack gap="6">
              <ListingImageGallery title={listing.title} images={listing.images} />

              <ListingSummaryCard listing={listing} />
              <ListingDescriptionCard description={listing.description} />
              <ListingDetailsCard listing={listing} />
            </Stack>

            <ListingSellerCard seller={listing.publishedByUser} listingId={listing.id} />
          </Grid>
        </Stack>
      </Container>

      <Footer groups={footerGroups} />
    </Box>
  )
}
