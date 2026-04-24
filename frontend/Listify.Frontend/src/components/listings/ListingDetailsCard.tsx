import type { ListingDetailDto } from "@/DTOs/Listing/ListingDetailDto"
import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/react"

type ListingDetailsCardProps = {
  listing: ListingDetailDto
}

export function ListingDetailsCard({ listing }: ListingDetailsCardProps) {
  const locationLabel = listing.location.area
    ? `${listing.location.name}, ${listing.location.area}`
    : listing.location.name

  return (
    <Box rounded="2xl" borderWidth="1px" borderColor="blue.100" bg="white" p={{ base: "5", md: "6" }} boxShadow="sm">
      <Heading size="md" mb="4">
        Деталі
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
        <Box>
          <Text fontSize="sm" color="gray.500">
            Категорія
          </Text>
          <Text fontWeight="semibold">{listing.Category.name}</Text>
        </Box>
        <Box>
          <Text fontSize="sm" color="gray.500">
            Місце
          </Text>
          <Text fontWeight="semibold">{locationLabel}</Text>
        </Box>
        <Box>
          <Text fontSize="sm" color="gray.500">
            Дата
          </Text>
          <Text fontWeight="semibold">
            {new Date(listing.createdOn).toLocaleDateString("uk-UA")}
          </Text>
        </Box>
      </SimpleGrid>
    </Box>
  )
}
