import { Box, Button, Heading, Icon, Stack, Text } from "@chakra-ui/react"
import type { IconType } from "react-icons"
import { FiCamera, FiPlus } from "react-icons/fi"

type ListingActionsProps = {
  onPublish: () => void
  isPublishing: boolean
  isPublishDisabled: boolean
  publishError: string | null
  publishSuccess: string | null
  helperText?: string
  previewLabel?: string
  publishLabel?: string
  previewIcon?: IconType
  publishIcon?: IconType
}

export function ListingActions({
  onPublish,
  isPublishing,
  isPublishDisabled,
  publishError,
  publishSuccess,
  helperText = "Попередній перегляд і публікація будуть доступні після перевірки даних.",
  previewLabel = "Перегляд",
  publishLabel = "Опублікувати",
  previewIcon = FiCamera,
  publishIcon = FiPlus,
}: ListingActionsProps) {
  return (
    <Box
      rounded="2xl"
      borderWidth="1px"
      borderColor="blue.100"
      bg="white"
      p={{ base: "4", md: "6" }}
      boxShadow="sm"
    >
      <Stack gap="3">
        <Heading size="md">Дії</Heading>
        <Text fontSize="sm" color="gray.600">
          {helperText}
        </Text>
        {publishError ? (
          <Text fontSize="sm" color="red.500">
            {publishError}
          </Text>
        ) : null}
        {publishSuccess ? (
          <Text fontSize="sm" color="green.600">
            {publishSuccess}
          </Text>
        ) : null}
        <Stack gap="2">
          <Button variant="outline" colorPalette="blue">
            <Icon as={previewIcon} />
            {previewLabel}
          </Button>
          <Button
            colorPalette="blue"
            loading={isPublishing}
            disabled={isPublishDisabled}
            onClick={onPublish}
          >
            <Icon as={publishIcon} />
            {publishLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
