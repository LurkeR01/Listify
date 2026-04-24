import { Box, Button, Heading, HStack, Icon, Stack, Text, Image, Input, Spinner } from "@chakra-ui/react"
import { FiUser, FiTrash2 } from "react-icons/fi"

type Props = {
  avatarUrl?: string | null
  avatarPreview?: string | null | undefined
  isUploading?: boolean
  onFileChange: (files: FileList | null) => void
  onRemove?: () => void
}

export function EditProfilePhotoCard({ avatarUrl, avatarPreview, isUploading, onFileChange, onRemove }: Props) {
  const preview = avatarPreview ?? avatarUrl

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
        <Heading size="md">Фото профілю</Heading>
        <HStack gap="5" align="center" wrap="wrap">
          <Box position="relative" w="24" h="24" rounded="full" bg="gray.100" overflow="hidden">
            {preview ? (
              <Image src={String(preview)} alt="Аватар" objectFit="cover" width="100%" height="100%" />
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" w="100%" h="100%">
                <Icon as={FiUser} boxSize="12" color="gray.400" />
              </Box>
            )}
            {/* removed camera overlay as requested */}
          </Box>

          <Stack gap="1">
            <Input type="file" accept="image/*" hidden id="avatar-input" onChange={(e) => onFileChange(e.target.files)} />
            <label htmlFor="avatar-input">
              <Button type="button" as="span" variant="outline" colorPalette="blue" size="sm" alignSelf="start">
                Завантажити фото
              </Button>
            </label>
            <HStack gap="2">
              {isUploading ? <Spinner size="sm" /> : null}
              <Button type="button" variant="ghost" size="sm" colorPalette="red" onClick={onRemove}>
                <Icon as={FiTrash2} mr="2" />
                Видалити
              </Button>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              Рекомендований розмір: 400x400. Підтримуються png/jpg.
            </Text>
          </Stack>
        </HStack>
      </Stack>
    </Box>
  )
}
