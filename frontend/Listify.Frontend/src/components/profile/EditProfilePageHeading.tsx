import { Button, Heading, Icon, Stack, Text } from "@chakra-ui/react"
import { FiArrowLeft } from "react-icons/fi"

type EditProfilePageHeadingProps = {
  onBack: () => void
}

export function EditProfilePageHeading({ onBack }: EditProfilePageHeadingProps) {
  return (
    <Stack gap="2">
      <Button
        onClick={onBack}
        variant="ghost"
        color="gray.600"
        px="0"
        height="auto"
        minW="auto"
        justifyContent="flex-start"
        gap="2"
        _hover={{ color: "gray.900", bg: "transparent" }}
        alignSelf="start"
      >
        <Icon as={FiArrowLeft} boxSize="4" />
        Назад до профілю
      </Button>

      <Heading size={{ base: "lg", md: "xl" }}>Редагування профілю</Heading>
      <Text color="gray.600">Оновіть ваші особисті дані</Text>
    </Stack>
  )
}
