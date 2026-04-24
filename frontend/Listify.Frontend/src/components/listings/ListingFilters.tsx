import {
  Box,
  Button,
  CheckboxGroup,
  CheckboxRoot,
  CheckboxControl,
  CheckboxHiddenInput,
  CheckboxLabel,
  HStack,
  Icon,
  Input,
  Portal,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react"
import { createListCollection } from "@chakra-ui/react"
import { FiChevronDown, FiChevronUp, FiMapPin, FiSliders, FiTruck } from "react-icons/fi"
import type { CategoryDto } from "@/DTOs/Category/CategoryDto";
import type { CategoryAttributeDto } from "@/DTOs/Category/CategoryAttributeDto";
import type { RequestCategoryAttributeValueDto } from "@/DTOs/Category/CategoryAttributeValueDto"
import { useEffect, useRef, useState } from "react"
import { useLocationSuggestions } from "@/hooks/useLocationSuggestions"

type ListingFiltersProps = {
  subcategories: CategoryDto[],
  attributes?: CategoryAttributeDto[],
  setSubCategoryId?: (id: number) => void,
  setAttributes?: (ids: RequestCategoryAttributeValueDto[]) => void
  rootCategoryId?: number
  setMinPrice?: (price: number | null) => void
  setMaxPrice?: (price: number | null) => void
  location?: string
  setLocation?: (value: string) => void
  setLocationRef?: (value: string) => void
  selectedSubCategoryId?: number | null
  selectedAttributes?: RequestCategoryAttributeValueDto[]
  minPrice?: number | null
  maxPrice?: number | null
  onReset?: () => void
}

export function ListingFilters({ 
  subcategories, 
  attributes = [],
  setSubCategoryId,
  setAttributes, 
  rootCategoryId,
  setMinPrice,
  setMaxPrice,
  location = "",
  setLocation,
  setLocationRef,
  selectedSubCategoryId,
  selectedAttributes = [],
  minPrice,
  maxPrice,
  onReset
   }: ListingFiltersProps) {
  const [expandedAttrIds, setExpandedAttrIds] = useState<Set<number>>(() => new Set())
  const [isLocationFocused, setIsLocationFocused] = useState(false)
  const prevAttrIdsKey = useRef<string>("")
  const { suggestions: locationSuggestions, isLoading: isLoadingLocations } =
    useLocationSuggestions(location)

  useEffect(() => {
    const nextKey = attributes.map((attr) => attr.id).join("|")
    if (nextKey !== prevAttrIdsKey.current) {
      setExpandedAttrIds(new Set(attributes.map((attr) => attr.id)))
      prevAttrIdsKey.current = nextKey
    }
  }, [attributes])

  const subcategoriesCollection = createListCollection({
    items: [
      ...(rootCategoryId !== undefined ? [{ label: "Всі категорії", value: String(rootCategoryId) }] : []),
      ...subcategories.map((item) => ({ label: item.name, value: String(item.id) })),
    ],
  })

  const valueIdToAttributeId = new Map<number, number>()
  attributes.forEach((attr) => {
    attr.values.forEach((val) => {
      valueIdToAttributeId.set(val.id, val.categoryAttributeId)
    })
  })

  const selectedValueIds = selectedAttributes.map((item) => String(item.categoryAttributeValueId))
  const selectValue = rootCategoryId !== undefined
    ? [String(selectedSubCategoryId ?? rootCategoryId)]
    : undefined
  const hasLocationInput = location.trim().length > 2
  const shouldShowLocationDropdown = isLocationFocused && hasLocationInput

  return (
    <Box
      rounded="2xl"
      borderWidth="1px"
      borderColor="blue.100"
      bg="white"
      p="5"
      boxShadow="sm"
      position={{ lg: "sticky" }}
      top={{ lg: "92px" }}
    >
      <Stack gap="5">
        <HStack justify="space-between">
          <HStack color="blue.600">
            <Icon as={FiSliders} />
            <Text fontWeight="semibold">Фільтри</Text>
          </HStack>
          <Button variant="ghost" size="xs" colorPalette="blue" onClick={onReset}>
            Скинути
          </Button>
        </HStack>

        <Stack gap="2">
          <Text fontWeight="medium" color="gray.700">Підкатегорія</Text>
          <Select.Root
            collection={subcategoriesCollection}
            value={selectValue}
            size="sm"
            positioning={{ sameWidth: true }}
            disabled={subcategoriesCollection.items.length === 0}
            onValueChange={(value) => {
              const id = parseInt(value.value[0])
              setSubCategoryId?.(id)
            }}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Оберіть підкатегорію" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {subcategoriesCollection.items.map((item) => (
                    <Select.Item key={item.value} item={item}>
                      <Select.ItemText>{item.label}</Select.ItemText>
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Stack>

        <Stack gap="2">
          <Text fontWeight="medium" color="gray.700">Ціна</Text>
          <HStack>
            <Input size="sm" placeholder="Від" 
              value={minPrice ?? ""}
              onChange={(e) => setMinPrice?.(e.target.value ? Number(e.target.value) : null)}
              />
            <Input size="sm" placeholder="До" 
              value={maxPrice ?? ""}
              onChange={(e) => setMaxPrice?.(e.target.value ? Number(e.target.value) : null)}
              />
          </HStack>
        </Stack>

        <CheckboxGroup
          value={selectedValueIds}
          onValueChange={(value) => {
            const dto = value
              .map((item) => {
                const categoryAttributeValueId = Number(item)
                const categoryAttributeId = valueIdToAttributeId.get(categoryAttributeValueId)
                if (categoryAttributeId === undefined) return null

                return { categoryAttributeId, categoryAttributeValueId }
              })
              .filter((item): item is RequestCategoryAttributeValueDto => item !== null)

            setAttributes?.(dto)
          }}
        >
          {attributes.map((attr) => (
            <Stack gap="2" key={attr.id}>
              <Button
                variant="ghost"
                size="sm"
                px="0"
                justifyContent="space-between"
                onClick={() => {
                  setExpandedAttrIds((prev) => {
                    const next = new Set(prev)
                    if (next.has(attr.id)) {
                      next.delete(attr.id)
                    } else {
                      next.add(attr.id)
                    }
                    return next
                  })
                }}
              >
                <Text fontWeight="medium" color="gray.700">{attr.name}</Text>
                <Icon as={expandedAttrIds.has(attr.id) ? FiChevronUp : FiChevronDown} />
              </Button>

              {expandedAttrIds.has(attr.id) && (
                <Stack gap="1">
                  {attr.values.map((val) => (
                    <CheckboxRoot key={val.id} value={String(val.id)} size="sm">
                      <CheckboxHiddenInput />
                      <CheckboxControl />
                      <CheckboxLabel fontSize="sm" color="gray.700">
                        {val.value}
                      </CheckboxLabel>
                    </CheckboxRoot>
                  ))}
                </Stack>
              )}
            </Stack>
          ))}
        </CheckboxGroup>

        <Stack gap="2">
          <Text fontWeight="medium" color="gray.700">Доставка</Text>
          <Button justifyContent="start" variant="ghost" size="sm">
            <Icon as={FiTruck} /> Доставка по Україні
          </Button>
          <Button justifyContent="start" variant="ghost" size="sm">
            <Icon as={FiMapPin} /> Самовивіз
          </Button>
        </Stack>

        <Stack gap="2" position="relative">
          <Text fontWeight="medium" color="gray.700">Місто</Text>
          <Input
            size="sm"
            placeholder="Наприклад, Київ"
            value={location}
            onFocus={() => setIsLocationFocused(true)}
            onBlur={() => {
              window.setTimeout(() => {
                setIsLocationFocused(false)
              }, 100)
            }}
            onChange={(event) => {
              setLocation?.(event.target.value)
              setLocationRef?.("")
            }}
          />

          {shouldShowLocationDropdown && (
            <Stack
              gap="0"
              borderWidth="1px"
              borderColor="gray.200"
              rounded="md"
              bg="white"
              boxShadow="sm"
              maxH="220px"
              overflowY="auto"
            >
              {isLoadingLocations ? (
                <Text px="3" py="2" fontSize="sm" color="gray.500">
                  Пошук міст...
                </Text>
              ) : locationSuggestions.length === 0 ? (
                <Text px="3" py="2" fontSize="sm" color="gray.500">
                  Місто не знайдено
                </Text>
              ) : (
                locationSuggestions.map((item) => (
                  <Button
                    key={item.ref || item.label}
                    type="button"
                    variant="ghost"
                    justifyContent="start"
                    borderRadius="0"
                    size="sm"
                    onMouseDown={(event) => {
                      event.preventDefault()
                      setLocation?.(item.label)
                      setLocationRef?.(item.ref)
                      setIsLocationFocused(false)
                    }}
                  >
                    {item.label}
                  </Button>
                ))
              )}
            </Stack>
          )}
        </Stack>

      </Stack>
    </Box>
  )
}
