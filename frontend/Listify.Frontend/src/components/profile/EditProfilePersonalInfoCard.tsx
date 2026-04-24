import type { LocationSuggestion } from "@/api/locations"
import { Box, Button, Heading, Icon, Input, InputGroup, Stack, Text } from "@chakra-ui/react"
import type { ChangeEvent } from "react"
import { FiMail, FiMapPin, FiPhone, FiUser } from "react-icons/fi"

type EditProfilePersonalInfoValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
}

type EditProfilePersonalInfoCardProps = {
  values: EditProfilePersonalInfoValues
  suggestions: LocationSuggestion[]
  isLoadingLocations: boolean
  shouldShowSelectionHint: boolean
  shouldShowLocationDropdown: boolean
  onFirstNameChange: (event: ChangeEvent<HTMLInputElement>) => void
  onLastNameChange: (event: ChangeEvent<HTMLInputElement>) => void
  onEmailChange: (event: ChangeEvent<HTMLInputElement>) => void
  onPhoneChange: (event: ChangeEvent<HTMLInputElement>) => void
  onLocationInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onLocationFocus: () => void
  onLocationBlur: () => void
  onLocationSelect: (location: LocationSuggestion) => void
}

export function EditProfilePersonalInfoCard({
  values,
  suggestions,
  isLoadingLocations,
  shouldShowSelectionHint,
  shouldShowLocationDropdown,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  onLocationInputChange,
  onLocationFocus,
  onLocationBlur,
  onLocationSelect,
}: EditProfilePersonalInfoCardProps) {
  return (
    <Box
      rounded="2xl"
      borderWidth="1px"
      borderColor="blue.100"
      bg="white"
      p={{ base: "5", md: "6" }}
      boxShadow="sm"
    >
      <Stack gap="4">
        <Heading size="md">Особиста інформація</Heading>

        <Stack gap="3">
          <Stack gap="1">
            <Text fontSize="sm" color="gray.700">
              Ім'я
            </Text>
            <InputGroup startElement={<Icon as={FiUser} color="gray.400" />}>
              <Input value={values.firstName} onChange={onFirstNameChange} placeholder="Введіть ім'я" required />
            </InputGroup>
          </Stack>

          <Stack gap="1">
            <Text fontSize="sm" color="gray.700">
              Прізвище
            </Text>
            <InputGroup startElement={<Icon as={FiUser} color="gray.400" />}>
              <Input value={values.lastName} onChange={onLastNameChange} placeholder="Введіть прізвище" required />
            </InputGroup>
          </Stack>

          <Stack gap="1">
            <Text fontSize="sm" color="gray.700">
              Email
            </Text>
            <InputGroup startElement={<Icon as={FiMail} color="gray.400" />}>
              <Input value={values.email} onChange={onEmailChange} type="email" placeholder="you@example.com" required />
            </InputGroup>
          </Stack>

          <Stack gap="1">
            <Text fontSize="sm" color="gray.700">
              Телефон
            </Text>
            <InputGroup startElement={<Icon as={FiPhone} color="gray.400" />}>
              <Input value={values.phone} onChange={onPhoneChange} type="tel" placeholder="+380..." required />
            </InputGroup>
          </Stack>

          <Stack gap="1" position="relative">
            <Text fontSize="sm" color="gray.700">
              Локація
            </Text>
            <InputGroup startElement={<Icon as={FiMapPin} color="gray.400" />}>
              <Input
                value={values.location}
                onFocus={onLocationFocus}
                onBlur={onLocationBlur}
                onChange={onLocationInputChange}
                placeholder="Ваше місто"
              />
            </InputGroup>

            {shouldShowSelectionHint ? (
              <Text fontSize="sm" color="orange.600">
                Оберіть місто зі списку підказок.
              </Text>
            ) : null}

            {shouldShowLocationDropdown ? (
              <Stack
                gap="0"
                borderWidth="1px"
                borderColor="gray.200"
                rounded="md"
                bg="white"
                boxShadow="sm"
                maxH="220px"
                overflowY="auto"
                zIndex="dropdown"
              >
                {isLoadingLocations ? (
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
                        onLocationSelect(item)
                      }}
                    >
                      {item.label}
                    </Button>
                  ))
                )}
              </Stack>
            ) : null}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  )
}
