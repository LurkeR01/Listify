import { Badge, Box, Flex, HStack, Heading, Icon, IconButton, Text } from "@chakra-ui/react"
import { LuFlag, LuHeart, LuMapPin, LuShare2 } from "react-icons/lu"
import type { ListingDetailDto } from "@/DTOs/Listing/ListingDetailDto"

type ListingSummaryCardProps = {
  listing: ListingDetailDto
}

export function ListingSummaryCard({ listing }: ListingSummaryCardProps) {
  const locationLabel = listing.location.area
    ? `${listing.location.name}, ${listing.location.area}`
    : listing.location.name
  const formattedPrice = `${new Intl.NumberFormat("uk-UA").format(listing.price)} грн`

  return (
    <Box rounded="2xl" borderWidth="1px" borderColor="blue.100" bg="white" p={{ base: "5", md: "6" }} boxShadow="sm">
      <Flex justify="space-between" gap="4" wrap="wrap">
        <Box flex="1">
          <HStack gap="3" mb="3" align="start">
            <Heading size="lg">{listing.title}</Heading>
          </HStack>
          <HStack gap="3" color="gray.600" fontSize="sm" flexWrap="wrap">
            <HStack gap="1">
              <Icon as={LuMapPin} boxSize="4" />
              <Text>{locationLabel}</Text>
            </HStack>
            <Text>•</Text>
            <Text>
              Опубліковано{" "}
              {new Date(listing.createdOn).toLocaleDateString("uk-UA", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </HStack>
        </Box>
        <HStack gap="2">
          <IconButton aria-label="Поділитися" variant="outline" colorPalette="blue">
            <Icon as={LuShare2} boxSize="4" />
          </IconButton>
          <IconButton aria-label="Додати до обраного" variant="outline" colorPalette="blue">
            <Icon as={LuHeart} boxSize="4" />
          </IconButton>
          <IconButton aria-label="Поскаржитися" variant="outline" colorPalette="blue">
            <Icon as={LuFlag} boxSize="4" />
          </IconButton>
        </HStack>
      </Flex>

      <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="blue.700" mt="6">
        {formattedPrice}
      </Text>

      {listing.attributes.length > 0 && (
        <HStack gap="2" mt="4" flexWrap="wrap">
          {listing.attributes.map((attribute) => (
            <Badge key={attribute.id} variant="subtle" colorPalette="blue">
                {attribute.categoryAttributeValue}
            </Badge>
          ))}
        </HStack>
      )}
    </Box>
  )
}
