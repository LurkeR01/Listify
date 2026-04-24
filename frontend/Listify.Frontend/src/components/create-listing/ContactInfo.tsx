import { Box, Heading, Icon, Input, InputGroup, Stack, Text } from "@chakra-ui/react"
import { FiMail, FiPhone, FiUser } from "react-icons/fi"

type ContactInfoProps = {
  name: string
  email: string
  phone: string
}

export function ContactInfo({ name, email, phone }: ContactInfoProps) {
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
        <Heading size="md">Контактна інформація</Heading>
        <Text fontSize="sm" color="gray.600">
          Контактні дані беруться з вашого профілю.
        </Text>
        <Stack gap="3">
          <Stack gap="2">
            <Text fontSize="sm" color="gray.700">
              Контактна особа
            </Text>
            <InputGroup startElement={<Icon as={FiUser} color="gray.400" />}>
              <Input value={name} disabled />
            </InputGroup>
          </Stack>
          <Stack gap="2">
            <Text fontSize="sm" color="gray.700">
              Email
            </Text>
            <InputGroup startElement={<Icon as={FiMail} color="gray.400" />}>
              <Input value={email} disabled />
            </InputGroup>
          </Stack>
          <Stack gap="2">
            <Text fontSize="sm" color="gray.700">
              Телефон
            </Text>
            <InputGroup startElement={<Icon as={FiPhone} color="gray.400" />}>
              <Input value={phone} disabled />
            </InputGroup>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  )
}
