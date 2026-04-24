import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import { ListingCard } from "@/components/listings/ListingCard"
import { ListingFilters } from "@/components/listings/ListingFilters"
import { ListingSorting } from "@/components/listings/ListingSorting"
import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { footerGroups } from "@/data/home-content"
import { useParams, useSearchParams } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import type { ListingDto } from "@/DTOs/Listing/ListingDto";
import { getListings } from "@/api/listings"
import type { CategoryDto } from "@/DTOs/Category/CategoryDto";
import { getCategories, getAttributesByCategoryId } from "@/api/categories"
import { useNavigate } from "react-router-dom"
import type { CategoryAttributeDto } from "@/DTOs/Category/CategoryAttributeDto"
import type { RequestCategoryAttributeValueDto } from "@/DTOs/Category/CategoryAttributeValueDto"

const sorting = ["Спочатку нові", "Дешевші", "Дорожчі", "Поруч зі мною"]

export function ListingsPage() {
  const { id } = useParams()
  const categoryId = id ? parseInt(id) : undefined
  const [searchParams] = useSearchParams()
  const searchText = searchParams.get("search") ?? undefined
  const [listings, setListings] = useState<ListingDto[]>([])
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [attributes, setAttributes] = useState<CategoryAttributeDto[]>([])
  const [subCategoryId, setSubCategoryId] = useState<number | null>(null)
  const [selectedAttributes, setSelectedAttributes] = useState<RequestCategoryAttributeValueDto[]>([])
  const [sortOption, setSortOption] = useState<string>(sorting[0])
  const [location, setLocation] = useState("")
  const [locationRef, setLocationRef] = useState("")
  const [minPrice, setMinPrice] = useState<number | null>(null)
  const [maxPrice, setMaxPrice] = useState<number | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    setSubCategoryId(null)
    setSelectedAttributes([])
    setLocation("")
    setLocationRef("")
    setMinPrice(null)
    setMaxPrice(null)
  }, [categoryId])

  const handleResetFilters = () => {
    setSubCategoryId(null)
    setSelectedAttributes([])
    setLocation("")
    setLocationRef("")
    setMinPrice(null)
    setMaxPrice(null)
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [listings, categories, attributes] = await Promise.all([
          getListings({
            categoryId: subCategoryId ?? categoryId,
            searchText: searchText,
            locationRef: locationRef.trim() || undefined,
            minPrice: minPrice ?? undefined,
            maxPrice: maxPrice ?? undefined,
            attributeFilters: selectedAttributes,
          }),
          getCategories(),
          categoryId ? getAttributesByCategoryId(subCategoryId ?? categoryId) : Promise.resolve([]),
        ])

        setListings(listings)
        setCategories(categories)
        setAttributes(attributes)
      } catch (error) {
        console.error(error)
      }
    }
    loadData()
  }, [categoryId, subCategoryId, selectedAttributes, locationRef, minPrice, maxPrice, searchText])  
  
  const rootCategories = categories.filter((category) => category.parentId === null)
  const subCategories = categoryId
    ? categories.filter((category) => category.parentId === categoryId)
    : []

  const sortedListings = useMemo(() => {
    const items = listings.slice()
    switch (sortOption) {
      case "Дешевші":
        return items.sort((a, b) => a.price - b.price)
      case "Дорожчі":
        return items.sort((a, b) => b.price - a.price)
      case "Спочатку нові":
        return items
      default:
        return items
    }
  }, [listings, sortOption])

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />

      <Container maxW="9xl" py={{ base: "6", md: "8" }}>
        <Stack gap="6">
          <Box
            rounded="2xl"
            borderWidth="1px"
            borderColor="blue.100"
            bg="white"
            p={{ base: "4", md: "5" }}
            boxShadow="sm"
          >
            <Stack gap="2">
              <Text fontWeight="semibold" color="gray.700">
                Категорії
              </Text>
              <HStack gap="2" overflowX="auto" pb="1">
                {rootCategories.map((item) => (
                  <Button
                    key={item.id}
                    size="sm"
                    rounded="full"
                    colorPalette="blue"
                    variant={item.id === categoryId ? "solid" : "outline"}
                    flexShrink={0}
                    onClick={() => navigate(`/listings/${item.id}`)}
                  >
                    {item.name}
                  </Button>
                ))}
              </HStack>
            </Stack>
          </Box>

          <Grid templateColumns={{ base: "1fr", lg: "280px 1fr" }} gap="6" alignItems="start">
              <ListingFilters
                subcategories={subCategories}
                attributes={attributes}
                setSubCategoryId={setSubCategoryId}
                setAttributes={setSelectedAttributes}
                rootCategoryId={categoryId ?? 0}
                setMinPrice={setMinPrice}
                setMaxPrice={setMaxPrice}
                selectedSubCategoryId={subCategoryId}
                selectedAttributes={selectedAttributes}
                location={location}
                setLocation={setLocation}
                setLocationRef={setLocationRef}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onReset={handleResetFilters}
              />

            <Stack gap="4">
              <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap="2">
                <Heading size="md" color="gray.900">
                  {categoryId
                    ? `Оголошення в категорії "${categories.find((c) => c.id === (subCategoryId ?? categoryId))?.name}"`
                    : "Оголошення"}
                </Heading>
                <Flex align="center" gap="3">
                  <Text color="gray.600" whiteSpace="nowrap">
                    Знайдено: {sortedListings.length}
                  </Text>
                  <ListingSorting
                    options={sorting}
                    value={sortOption}
                    onChange={setSortOption}
                  />
                </Flex>
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="4">
                {sortedListings.map((item, index) => (
                  <ListingCard key={`${item.id}-${index}`} listing={item} />
                ))}
              </SimpleGrid>
            </Stack>
          </Grid>
        </Stack>
      </Container>

      <Footer groups={footerGroups} />
    </Box>
  )
}
