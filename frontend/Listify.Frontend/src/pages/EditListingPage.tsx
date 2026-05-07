import {
  Box,
  Center,
  Container,
  Flex,
  Grid,
  Heading,
  Input,
  InputGroup,
  Spinner,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FiSave } from "react-icons/fi"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { footerGroups } from "@/data/home-content"
import { getAttributesByCategoryId, getCategories } from "@/api/categories"
import { getListingById, updateListing } from "@/api/listings"
import type { CategoryDto } from "@/DTOs/Category/CategoryDto"
import type { CategoryAttributeDto } from "@/DTOs/Category/CategoryAttributeDto"
import { CategorySelector } from "@/components/create-listing/CategorySelector"
import { PhotoUploader } from "@/components/create-listing/PhotoUploader"
import { AttributesForm } from "@/components/create-listing/AttributesForm"
import { LocationForm } from "@/components/create-listing/LocationForm"
import { ContactInfo } from "@/components/create-listing/ContactInfo"
import { ListingActions } from "@/components/create-listing/ListingActions"
import { MAX_DESCRIPTION_LENGTH, MAX_PHOTOS, MAX_TITLE_LENGTH } from "@/constants/listing"
import { usePhotos, type PhotoItem } from "@/hooks/usePhotos"
import { useAuth } from "@/auth/AuthContext"
import type { ResponseUserDto } from "@/DTOs/User/UserDto"
import type { ListingDetailDto } from "@/DTOs/Listing/ListingDetailDto"
import type { LocationSuggestion } from "@/api/locations"
import type { ListingImageDto } from "@/DTOs/Listing/ListingImageDto"
import { uploadImageToCloudinary } from "@/api/upload"
import type { UpdateListingDto } from "@/DTOs/Listing/UpdateListingDto"

const buildContactName = (user: ResponseUserDto | null) => {
  if (!user) return ""
  const username = user.username?.trim() ?? ""
  if (username) return username
  const firstName = user.firstName?.trim() ?? ""
  const lastName = user.lastName?.trim() ?? ""
  return [firstName, lastName].filter(Boolean).join(" ").trim()
}

const toSuggestion = (value: ListingDetailDto["location"]): LocationSuggestion => {
  const name = String(value?.name ?? "").trim()
  const area = String(value?.area ?? "").trim()
  const ref = String(value?.ref ?? "").trim()
  const label = area ? `${name}, ${area}` : name
  return { name, area, ref, label, value: label }
}

const getErrorMessage = () => {
  return "Не вдалося зберегти зміни. Перевірте дані та спробуйте ще раз."
}

const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase()

function EditListingPhotos({
  images,
  onChange,
}: {
  images?: ListingImageDto[]
  onChange: (photos: PhotoItem[]) => void
}) {
  const initialPhotos = useMemo(() => {
    const items = images ?? []
    return items.map((img) => ({
      id: img.id,
      url: img.url,
      rotation: 0,
    }))
  }, [images])

  const {
    photos,
    fileInputRef,
    remainingSlots,
    addPhotos,
    removePhoto,
    rotatePhoto,
    handleDragStart,
    handleDrop,
  } = usePhotos({ maxPhotos: MAX_PHOTOS, initialPhotos })

  useEffect(() => {
    onChange(photos)
  }, [onChange, photos])

  return (
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
  )
}

export function EditListingPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
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

  const [listing, setListing] = useState<ListingDetailDto | null>(null)
  const [isLoadingListing, setIsLoadingListing] = useState(false)
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  const initialCategoryIdRef = useRef<number | null>(null)
  const didPrefillAttributesRef = useRef(false)

  const contactName = buildContactName(user)
  const contactEmail = user?.email?.trim() ?? ""
  const contactPhone = user?.phoneNumber?.trim() ?? ""
  const parsedPrice = Number(price)
  const canSave = Boolean(
    selectedCategory &&
      title.trim() &&
      description.trim() &&
      selectedLocation?.ref &&
      Number.isFinite(parsedPrice) &&
      parsedPrice > 0
  )

  useEffect(() => {
    if (!id) {
      navigate("/my-listings", { replace: true })
      return
    }

    const load = async () => {
      setIsLoadingListing(true)
      setIsLoadingCategories(true)

      try {
        const [categoriesData, listingData] = await Promise.all([getCategories(), getListingById(id)])
        setCategories(categoriesData)
        setListing(listingData)

        setTitle(listingData.title ?? "")
        setDescription(listingData.description ?? "")
        setPrice(String(listingData.price ?? ""))

        const suggestion = toSuggestion(listingData.location)
        setLocation(suggestion.label)
        setSelectedLocation(suggestion)

        initialCategoryIdRef.current = listingData.Category?.id ?? null
        didPrefillAttributesRef.current = false
        const resolvedCategory =
          categoriesData.find((cat) => cat.id === listingData.Category.id) ?? listingData.Category
        setSelectedCategory(resolvedCategory)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoadingListing(false)
        setIsLoadingCategories(false)
      }
    }

    load()
  }, [id, navigate])

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

  useEffect(() => {
    if (!listing || !selectedCategory) return
    if (didPrefillAttributesRef.current) return
    if (attributes.length === 0) return
    if (initialCategoryIdRef.current !== selectedCategory.id) return

    const next: Record<number, string | undefined> = {}

    attributes.forEach((attr) => {
      const match = listing.attributes.find(
        (item) => normalize(item.categoryAttributeName) === normalize(attr.name)
      )
      if (!match) {
        next[attr.id] = undefined
        return
      }
      const valueMatch = attr.values.find(
        (val) => normalize(val.value) === normalize(match.categoryAttributeValue)
      )
      next[attr.id] = valueMatch ? String(valueMatch.id) : undefined
    })

    setAttributeSelections(next)
    didPrefillAttributesRef.current = true
  }, [attributes, listing, selectedCategory])

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
  }

  const handleSave = async () => {
    if (!id) return

    if (!selectedLocation) {
      setSaveError("Оберіть місто зі списку підказок")
      return
    }

    if (!canSave || !selectedCategory) {
      setSaveError("Заповніть назву, опис, ціну, локацію та оберіть категорію")
      return
    }

    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(null)

    try {
      const listingAttributeDtos = Object.values(attributeSelections)
        .filter((value): value is string => Boolean(value) && value !== "other")
        .map((value) => ({
          CategoryAttributeValueId: Number(value),
        }))

      const existingPublicIdByUrl = new Map<string, string>()
      ;(listing?.images ?? []).forEach((img) => {
        if (img.url) {
          existingPublicIdByUrl.set(img.url, img.publicId ?? "")
        }
      })

      const listingImageDtos = await Promise.all(
        photos.map(async (photo, index) => {
          if (photo.url.startsWith("blob:")) {
            const uploaded = await uploadImageToCloudinary(photo.file)
            return {
              Id: null,
              Url: uploaded.url,
              Order: index,
              PublicId: uploaded.publicId,
            }
          }

          return {
            Id: photo.id ?? null,
            Url: photo.url,
            Order: index,
            PublicId: existingPublicIdByUrl.get(photo.url) ?? "",
          }
        })
      )

      const payload: UpdateListingDto = {
        Id: id,
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

      await updateListing(payload)
      setSaveSuccess("Зміни збережено")
      navigate("/my-listings")
    } catch (error) {
      console.error("Failed to update listing:", error)
      setSaveError(getErrorMessage())
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoadingListing && !listing) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
        <Header />
        <Center flex="1" flexDirection="column" gap="3">
          <Spinner size="lg" color="blue.600" />
          <Text color="gray.500">Завантаження оголошення…</Text>
        </Center>
        <Footer groups={footerGroups} />
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      <Header />

      <Box flex="1">
        <Container maxW="9xl" py={{ base: "6", md: "8" }}>
          <Stack gap="6">
            <Stack gap="1">
              <Heading size={{ base: "lg", md: "xl" }}>Редагування оголошення</Heading>
              <Text color="gray.600">
                Оновіть основні поля, фото та деталі вашого товару.
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
                      onSelectCategory={(category) => {
                        didPrefillAttributesRef.current = true
                        setSelectedCategory(category)
                      }}
                    />
                  </Stack>
                </Box>

                <EditListingPhotos
                  key={listing?.id ?? "listing-photos"}
                  images={listing?.images}
                  onChange={setPhotos}
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
                  onPublish={handleSave}
                  isPublishing={isSaving}
                  isPublishDisabled={!canSave || isSaving}
                  publishError={saveError}
                  publishSuccess={saveSuccess}
                  helperText="Збереження змін буде доступне після перевірки даних."
                  publishLabel="Зберегти зміни"
                  publishIcon={FiSave}
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
