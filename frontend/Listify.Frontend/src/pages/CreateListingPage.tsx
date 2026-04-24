import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Input,
  InputGroup,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { footerGroups } from "@/data/home-content"
import { getAttributesByCategoryId, getCategories } from "@/api/categories"
import type { CategoryDto } from "@/DTOs/Category/CategoryDto"
import type { CategoryAttributeDto } from "@/DTOs/Category/CategoryAttributeDto"
import { CategorySelector } from "@/components/create-listing/CategorySelector"
import { PhotoUploader } from "@/components/create-listing/PhotoUploader"
import { AttributesForm } from "@/components/create-listing/AttributesForm"
import { LocationForm } from "@/components/create-listing/LocationForm"
import { ContactInfo } from "@/components/create-listing/ContactInfo"
import { ListingActions } from "@/components/create-listing/ListingActions"
import { MAX_DESCRIPTION_LENGTH, MAX_PHOTOS, MAX_TITLE_LENGTH } from "@/constants/listing"
import { usePhotos } from "@/hooks/usePhotos"
import { useAuth } from "@/auth/AuthContext"
import type { ResponseUserDto } from "@/DTOs/User/UserDto"
import { uploadImageToCloudinary } from "@/api/upload"
import { createListing } from "@/api/listings"
import type { CreateListingDto } from "@/DTOs/Listing/CreateListingDto"
import type { LocationSuggestion } from "@/api/locations"
import { toaster } from "@/components/ui/toaster"

const buildContactName = (user: ResponseUserDto | null) => {
  if (!user) return ""
  const username = user.username?.trim() ?? ""
  if (username) return username
  const firstName = user.firstName?.trim() ?? ""
  const lastName = user.lastName?.trim() ?? ""
  return [firstName, lastName].filter(Boolean).join(" ").trim()
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return "Не вдалося опублікувати оголошення"
}

export function CreateListingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [location, setLocation] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null)

  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [attributes, setAttributes] = useState<CategoryAttributeDto[]>([])
  const [attributeSelections, setAttributeSelections] = useState<Record<number, string | undefined>>({})
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(null)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null)

  const {
    photos,
    fileInputRef,
    remainingSlots,
    addPhotos,
    removePhoto,
    rotatePhoto,
    handleDragStart,
    handleDrop,
  } = usePhotos({ maxPhotos: MAX_PHOTOS })

  const contactName = buildContactName(user)
  const contactEmail = user?.email?.trim() ?? ""
  const contactPhone = user?.phoneNumber?.trim() ?? ""
  const parsedPrice = Number(price)
  const canPublish = Boolean(
    selectedCategory &&
      title.trim() &&
      description.trim() &&
      selectedLocation?.ref &&
      Number.isFinite(parsedPrice) &&
      parsedPrice > 0
  )

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true)
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    if (!selectedCategory) {
      setAttributes([])
      setAttributeSelections({})
      return
    }

    const loadAttributes = async () => {
      try {
        const data = await getAttributesByCategoryId(selectedCategory.id)
        setAttributes(data)
      } catch (error) {
        console.error(error)
        setAttributes([])
      }
    }

    setAttributeSelections({})
    loadAttributes()
  }, [selectedCategory])

  useEffect(() => {
    if (attributes.length === 0) {
      setAttributeSelections({})
      return
    }

    setAttributeSelections((prev) => {
      const next: Record<number, string | undefined> = {}
      attributes.forEach((attr) => {
        next[attr.id] = prev[attr.id]
      })
      return next
    })
  }, [attributes])

  const handleAttributeChange = (attributeId: number, nextValue: string) => {
    setAttributeSelections((prev) => ({
      ...prev,
      [attributeId]: nextValue || undefined,
    }))
  }

  const handleLocationChange = (value: string) => {
    setLocation(value)
    setSelectedLocation(null)
  }

  const handleLocationSelect = (value: LocationSuggestion) => {
    setLocation(value.label)
    setSelectedLocation(value)
    setPublishError(null)
  }

  const handlePublish = async () => {
    if (!selectedLocation) {
      setPublishError("Оберіть місто зі списку підказок")
      return
    }

    if (!canPublish || !selectedCategory) {
      setPublishError("Заповніть назву, опис, ціну, локацію та оберіть категорію")
      return
    }

    setIsPublishing(true)
    setPublishError(null)
    setPublishSuccess(null)

    try {
      const listingAttributeDtos = Object.values(attributeSelections)
        .filter((value): value is string => Boolean(value) && value !== "other")
        .map((value) => ({
          CategoryAttributeValueId: Number(value),
        }))

      const listingImageDtos = await Promise.all(
        photos.map(async (photo, index) => {
          const uploaded = await uploadImageToCloudinary(photo.file)
          return {
            Url: uploaded.url,
            Order: index,
            PublicId: uploaded.publicId,
          }
        })
      )

      const payload: CreateListingDto = {
        Title: title.trim(),
        Description: description.trim(),
        Price: parsedPrice,
        Location: {
          Name: selectedLocation.name,
          Ref: selectedLocation.ref,
          Area: selectedLocation.area,
        },
        CategoryId: selectedCategory.id,
        ListingAttributeDtos: listingAttributeDtos,
        ListingImageDtos: listingImageDtos,
      }

      const created = (await createListing(payload)) as Record<string, unknown> | undefined
      const createdId = String(created?.id ?? created?.Id ?? "")

      setPublishSuccess("Оголошення успішно опубліковано")

      if (createdId) {
        navigate(`/listing/${createdId}`)
        toaster.create({
                title: "Оголошення видалено",
                type: "success",
              });
      } else {
        
        navigate("/my-listings")
        toaster.create({
                title: "Оголошення видалено",
                type: "success",
              });
      }
    } catch (error) {
      setPublishError(getErrorMessage(error))
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      <Header />

      <Box flex="1">
        <Container maxW="9xl" py={{ base: "6", md: "8" }}>
          <Stack gap="6">
            <Stack gap="1">
              <Heading size={{ base: "lg", md: "xl" }}>Створення оголошення</Heading>
              <Text color="gray.600">
                Заповніть основні поля, додайте фото та опишіть деталі вашого товару.
              </Text>
            </Stack>

            <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="8" alignItems="start">
              <Stack gap="6">
                <Box
                  rounded="2xl"
                  borderWidth="1px"
                  borderColor="blue.100"
                  bg="white"
                  p={{ base: "4", md: "6" }}
                  boxShadow="sm"
                >
                  <Stack gap="4">
                    <Heading size="md">Основна інформація</Heading>

                    <Stack gap="2">
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" color="gray.700">
                          Назва оголошення
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {title.length}/{MAX_TITLE_LENGTH}
                        </Text>
                      </Flex>
                      <Input
                        placeholder="Наприклад, iPhone 13 Pro 256GB"
                        value={title}
                        maxLength={MAX_TITLE_LENGTH}
                        onChange={(event) => setTitle(event.target.value)}
                      />
                    </Stack>

                    <CategorySelector
                      categories={categories}
                      selectedCategory={selectedCategory}
                      isLoading={isLoadingCategories}
                      onSelectCategory={setSelectedCategory}
                    />
                  </Stack>
                </Box>

                <PhotoUploader
                  photos={photos}
                  maxPhotos={MAX_PHOTOS}
                  remainingSlots={remainingSlots}
                  fileInputRef={fileInputRef}
                  onAddPhotos={addPhotos}
                  onRemovePhoto={removePhoto}
                  onRotatePhoto={rotatePhoto}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                />

                <Box
                  rounded="2xl"
                  borderWidth="1px"
                  borderColor="blue.100"
                  bg="white"
                  p={{ base: "4", md: "6" }}
                  boxShadow="sm"
                >
                  <Stack gap="4">
                    <Heading size="md">Деталі товару</Heading>

                    <Stack gap="2">
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" color="gray.700">
                          Опис
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {description.length}/{MAX_DESCRIPTION_LENGTH}
                        </Text>
                      </Flex>
                      <Textarea
                        placeholder="Опишіть стан, комплектацію, причину продажу..."
                        value={description}
                        maxLength={MAX_DESCRIPTION_LENGTH}
                        onChange={(event) => setDescription(event.target.value)}
                        minH="140px"
                      />
                    </Stack>

                    <Stack gap="2">
                      <Text fontSize="sm" color="gray.700">
                        Ціна
                      </Text>
                      <InputGroup endElement="грн">
                        <Input
                          type="number"
                          min={0}
                          value={price}
                          onChange={(event) => setPrice(event.target.value)}
                        />
                      </InputGroup>
                    </Stack>

                    <Stack gap="3">
                      <Text fontSize="sm" color="gray.700">
                        Характеристики
                      </Text>
                      <AttributesForm
                        selectedCategory={selectedCategory}
                        attributes={attributes}
                        attributeSelections={attributeSelections}
                        onChange={handleAttributeChange}
                      />
                    </Stack>
                  </Stack>
                </Box>

                <LocationForm
                  location={location}
                  onChange={handleLocationChange}
                  onSelect={handleLocationSelect}
                  isLocationSelected={Boolean(selectedLocation?.ref)}
                />
              </Stack>

              <Stack gap="6" position={{ lg: "sticky" }} top={{ lg: "92px" }}>
                <ContactInfo name={contactName} email={contactEmail} phone={contactPhone} />
                <ListingActions
                  onPublish={handlePublish}
                  isPublishing={isPublishing}
                  isPublishDisabled={!canPublish || isPublishing}
                  publishError={publishError}
                  publishSuccess={publishSuccess}
                />
              </Stack>
            </Grid>
          </Stack>
        </Container>
      </Box>

      <Footer groups={footerGroups} />
    </Box>
  )
}
