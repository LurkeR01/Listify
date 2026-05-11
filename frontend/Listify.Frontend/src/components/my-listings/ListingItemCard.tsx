import { Box, Button, Flex, Heading, HStack, Image, Separator, Stack, Text } from "@chakra-ui/react"
import { Clock, MapPin, Pencil, Power, PowerOff, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import type { ListingDto } from "@/DTOs/Listing/ListingDto"
import { ListingStatus } from "@/data/home-content"


type ListingItemCardProps = {
  listing: ListingDto
  onEdit?: ((id: string) => void) | null
  onDelete?: ((id: string) => void) | null
  onToggleStatus?: ((id: string, status: ListingStatus) => void) | null
}

export function ListingItemCard({
  listing,
  onEdit,
  onDelete,
  onToggleStatus,
}: ListingItemCardProps) {
  return (
    <Box
      bg="white"
      p="4"
      rounded="2xl"
      borderWidth="1px"
      borderColor="gray.100"
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ borderColor: "blue.200", boxShadow: "md" }}
    >
      <Flex gap="6" align="center" direction={{ base: "column", sm: "row" }}>
        {/* Image */}
        <Link to={`/listing/${listing.id}`}>
          <Image
            src={listing.imageUrl ?? "/placeholder.png"}
            alt={listing.title}
            w={{ base: "full", sm: "240px" }}
            h="160px"
            objectFit="cover"
            rounded="xl"
          />
        </Link>

        {/* Content */}
        <Stack flex="1" gap="3">
          <Flex justify="space-between" align="flex-start">
            <Stack gap="1">
              <Link to={`/listing/${listing.id}`}>
                <Heading
                  as="span"
                  size="2xl"
                  color="gray.900"
                  _hover={{ color: "blue.600" }}
                  cursor="pointer"
                >
                  {listing.title}
                </Heading>
              </Link>
              {/* <HStack gap="1" color="gray.500" fontSize="xs">
                {listing.categoryPath.map((cat, i) => (
                  <HStack key={cat} gap="1">
                    <Text>{cat}</Text>
                    {i < listing.categoryPath.length - 1 && <ChevronRight size={12} />}
                  </HStack>
                ))}
              </HStack> */}
            </Stack>
            <Text fontSize="xl" fontWeight="bold" color="blue.600">
              {listing.price.toLocaleString()} грн
            </Text>
          </Flex>

          <HStack gap="6" color="gray.600" fontSize="sm">
            <HStack gap="1">
              <MapPin size={14} />
              <Text>{listing.location.name} • {listing.location.area}</Text>
            </HStack>
            {/* <HStack gap="1">
              <Eye size={14} />
              <Text>{listing.views} переглядів</Text>
            </HStack> */}
          </HStack>

          <Separator borderColor="gray.50" />

          {/* Actions */}
          <Flex justify="space-between" align="center">
            <HStack gap="3">
              {onEdit ? (
                <Button
                  size="sm"
                  variant="ghost"
                  colorPalette="blue"
                  rounded="lg"
                  onClick={() => onEdit(listing.id)}
                >
                  <Pencil size={16} /> Редагувати
                </Button>
              ) : null}

              {onDelete ? (
                <Button
                  size="sm"
                  variant="ghost"
                  colorPalette="red"
                  rounded="lg"
                  onClick={() => onDelete(listing.id)}
                >
                  <Trash2 size={16} /> Видалити
                </Button>
              ) : null}
            </HStack>

            {onToggleStatus ? (
              <Button
                size="sm"
                variant="outline"
                colorPalette={listing.status === ListingStatus.Published ? "gray" : "green"}
                rounded="lg"
                onClick={() => onToggleStatus(listing.id, listing.status === ListingStatus.Published ? ListingStatus.Archived : ListingStatus.Published)}
                disabled={listing.status === ListingStatus.Draft}
              >
                {(() => {
                  switch (listing.status) {
                    case ListingStatus.Published:
                      return (
                        <>
                          <PowerOff size={16} /> 
                          <Text as="span" ml="2">Деактивувати</Text>
                        </>
                      )
                    case ListingStatus.Draft:
                      return (
                        <>
                          <Clock size={16} /> 
                          <Text as="span" ml="2">На модерації</Text>
                        </>
                      )
                    case ListingStatus.Archived:
                    default:
                      return (
                        <>
                          <Power size={16} /> 
                          <Text as="span" ml="2">Активувати</Text>
                        </>
                      )
                  }
                })()}
              </Button>
            ) : null}
          </Flex>
        </Stack>
      </Flex>
    </Box>
  )
}
