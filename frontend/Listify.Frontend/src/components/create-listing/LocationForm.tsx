import { Box, Button, Heading, Icon, Input, InputGroup, Stack, Text } from "@chakra-ui/react"
import { FiMapPin } from "react-icons/fi"
import { useState } from "react"
import { useLocationSuggestions } from "@/hooks/useLocationSuggestions"
import type { LocationSuggestion } from "@/api/locations"

type LocationFormProps = {
  location: string
  onChange: (value: string) => void
  onSelect: (value: LocationSuggestion) => void
  isLocationSelected: boolean
}

export function LocationForm({
  location,
  onChange,
  onSelect,
  isLocationSelected,
}: LocationFormProps) {
  const [isFocused, setIsFocused] = useState(false)
  const { suggestions, isLoading } = useLocationSuggestions(location)
  const hasLocationInput = location.trim().length >= 2
  const shouldShowDropdown = isFocused && hasLocationInput
  const shouldShowSelectionHint = location.trim().length > 0 && !isLocationSelected

  return (
    <Box
      rounded="2xl"
      borderWidth="1px"
      borderColor="blue.100"
      bg="white"
      p={{ base: "4", md: "6" }}
      boxShadow="sm"
    >
      <Stack gap="4">
        <Heading size="md">Місцезнаходження</Heading>
        <InputGroup startElement={<Icon as={FiMapPin} color="gray.400" />}>
          <Input
            placeholder="Наприклад, Київ, Позняки"
            value={location}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              window.setTimeout(() => {
                setIsFocused(false)
              }, 100)
            }}
            onChange={(event) => onChange(event.target.value)}
          />
        </InputGroup>
        {shouldShowSelectionHint ? (
          <Text fontSize="sm" color="orange.600">
            Оберіть місто зі списку підказок.
          </Text>
        ) : null}

        {shouldShowDropdown && (
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
            {isLoading ? (
              <Text px="3" py="2" fontSize="sm" color="gray.500">
                Пошук міст...
              </Text>
            ) : suggestions.length === 0 ? (
              <Text px="3" py="2" fontSize="sm" color="gray.500">
                Місто не знайдено
              </Text>
            ) : (
              suggestions.map((item) => (
                <Button
                  key={item.ref || item.label}
                  type="button"
                  variant="ghost"
                  justifyContent="start"
                  borderRadius="0"
                  size="sm"
                  onMouseDown={(event) => {
                    event.preventDefault()
                    onSelect(item)
                    setIsFocused(false)
                  }}
                >
                  {item.label}
                </Button>
              ))
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
