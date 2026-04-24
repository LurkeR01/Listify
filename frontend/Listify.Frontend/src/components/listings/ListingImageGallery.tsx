import { Box, Center, HStack, Icon, IconButton, Image, Text } from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { LuChevronLeft, LuChevronRight, LuImageOff } from "react-icons/lu"
import type { ListingImageDto } from "@/DTOs/Listing/ListingImageDto"

type ListingImageGalleryProps = {
  title: string
  images?: ListingImageDto[]
}

export function ListingImageGallery({ title, images = [] }: ListingImageGalleryProps) {
  const orderedImages = useMemo(() => {
    return [...images].sort((a, b) => a.order - b.order)
  }, [images])

  const hasImages = orderedImages.length > 0
  const [activeIndex, setActiveIndex] = useState(0)
  const maxIndex = Math.max(orderedImages.length - 1, 0)
  const safeActiveIndex = Math.min(activeIndex, maxIndex)
  const activeImage = orderedImages[safeActiveIndex]

  const showPrevious = () => {
    if (!hasImages) return
    setActiveIndex(safeActiveIndex === 0 ? maxIndex : safeActiveIndex - 1)
  }

  const showNext = () => {
    if (!hasImages) return
    setActiveIndex(safeActiveIndex === maxIndex ? 0 : safeActiveIndex + 1)
  }

  return (
    <Box rounded="2xl" borderWidth="1px" borderColor="blue.100" bg="white" overflow="hidden" boxShadow="sm">
      <Box
        position="relative"
        bg="gray.100"
        h={{ base: "360px", md: "560px" }}
      >
        {activeImage ? (
          <Center w="full" h="full" p={{ base: "2", md: "4" }}>
            <Image
              src={activeImage.url}
              alt={`${title} - фото ${safeActiveIndex + 1}`}
              maxW="full"
              maxH="full"
              w="auto"
              h="auto"
              objectFit="contain"
              loading="eager"
            />
          </Center>
        ) : (
          <Center h="full" color="gray.500" flexDirection="column" gap="2">
            <Icon as={LuImageOff} boxSize="6" />
            <Text fontSize="sm">Фото відсутні</Text>
          </Center>
        )}

        {orderedImages.length > 1 ? (
          <>
            <IconButton
              aria-label="Попереднє фото"
              variant="solid"
              colorPalette="blue"
              size="sm"
              position="absolute"
              left="3"
              top="50%"
              transform="translateY(-50%)"
              onClick={showPrevious}
            >
              <Icon as={LuChevronLeft} />
            </IconButton>
            <IconButton
              aria-label="Наступне фото"
              variant="solid"
              colorPalette="blue"
              size="sm"
              position="absolute"
              right="3"
              top="50%"
              transform="translateY(-50%)"
              onClick={showNext}
            >
              <Icon as={LuChevronRight} />
            </IconButton>
            <Box
              position="absolute"
              bottom="3"
              left="50%"
              transform="translateX(-50%)"
              px="3"
              py="1"
              rounded="full"
              bg="blackAlpha.600"
              color="white"
              fontSize="xs"
              fontWeight="medium"
            >
              {safeActiveIndex + 1} / {orderedImages.length}
            </Box>
          </>
        ) : null}
      </Box>

      {orderedImages.length > 1 ? (
        <HStack p="3" gap="2" overflowX="auto">
          {orderedImages.map((image, index) => {
            const isActive = index === safeActiveIndex

            return (
              <Box
                key={`${image.id}-${index}`}
                as="button"
                onClick={() => setActiveIndex(index)}
                rounded="lg"
                overflow="hidden"
                borderWidth={isActive ? "2px" : "1px"}
                borderColor={isActive ? "blue.500" : "blue.100"}
                flexShrink={0}
                w="72px"
                h="72px"
              >
                <Image
                  src={image.url}
                  alt={`${title} - мініатюра ${index + 1}`}
                  w="full"
                  h="full"
                  objectFit="cover"
                  loading="lazy"
                />
              </Box>
            )
          })}
        </HStack>
      ) : null}
    </Box>
  )
}
