import { Badge, Box, Button, Flex, Heading, HStack, Icon, IconButton, Image, Input, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import type { DragEvent, RefObject } from "react"
import { FiImage, FiRotateCw, FiTrash2 } from "react-icons/fi"
import type { PhotoItem } from "@/hooks/usePhotos"

type PhotoUploaderProps = {
  photos: PhotoItem[]
  maxPhotos: number
  remainingSlots: number
  fileInputRef: RefObject<HTMLInputElement | null>
  onAddPhotos: (files: FileList | null) => void
  onRemovePhoto: (id: string) => void
  onRotatePhoto: (id: string) => void
  onDragStart: (event: DragEvent<HTMLDivElement>, index: number) => void
  onDrop: (event: DragEvent<HTMLDivElement>, index: number) => void
}

export function PhotoUploader({
  photos,
  maxPhotos,
  remainingSlots,
  fileInputRef,
  onAddPhotos,
  onRemovePhoto,
  onRotatePhoto,
  onDragStart,
  onDrop,
}: PhotoUploaderProps) {
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
        <Flex justify="space-between" align="center">
          <Heading size="md">Фото</Heading>
          <Text fontSize="sm" color="gray.500">
            {photos.length}/{maxPhotos}
          </Text>
        </Flex>
        <Text fontSize="sm" color="gray.600">
          Додайте до {maxPhotos} фото. Перше фото буде головним. Ви можете перетягувати,
          повертати та видаляти фото.
        </Text>

        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => onAddPhotos(event.target.files)}
        />

        <SimpleGrid columns={{ base: 2, md: 4 }} gap="3">
          {photos.map((photo, index) => (
            <Box
              key={photo.id}
              borderWidth="1px"
              borderColor="blue.100"
              rounded="xl"
              overflow="hidden"
              position="relative"
              draggable
              onDragStart={(event) => onDragStart(event, index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => onDrop(event, index)}
              cursor="grab"
            >
              <Box bg="gray.100" h="110px" display="flex" alignItems="center" justifyContent="center">
                <Image
                  src={photo.url}
                  alt={`Фото ${index + 1}`}
                  objectFit="cover"
                  width="100%"
                  height="100%"
                  style={{ transform: `rotate(${photo.rotation}deg)` }}
                />
              </Box>
              {index === 0 ? (
                <Badge colorPalette="blue" position="absolute" top="2" left="2" rounded="full">
                  Головне
                </Badge>
              ) : null}
              <HStack position="absolute" top="2" right="2" gap="1">
                <IconButton
                  aria-label="Повернути фото"
                  size="xs"
                  variant="solid"
                  colorPalette="blue"
                  onClick={() => onRotatePhoto(photo.id)}
                >
                  <Icon as={FiRotateCw} />
                </IconButton>
                <IconButton
                  aria-label="Видалити фото"
                  size="xs"
                  variant="solid"
                  colorPalette="red"
                  onClick={() => onRemovePhoto(photo.id)}
                >
                  <Icon as={FiTrash2} />
                </IconButton>
              </HStack>
            </Box>
          ))}

          {remainingSlots > 0 ? (
            <Button
              variant="outline"
              borderStyle="dashed"
              borderColor="blue.200"
              rounded="xl"
              height="110px"
              flexDirection="column"
              gap="2"
              color="gray.600"
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon as={FiImage} boxSize="5" />
              Додати фото
            </Button>
          ) : null}
        </SimpleGrid>
      </Stack>
    </Box>
  )
}
