import type { ListingDetailDto } from "@/DTOs/Listing/ListingDetailDto"
import { Box, Heading, SimpleGrid, Text, Separator, VStack, HStack } from "@chakra-ui/react"

type ListingDetailsCardProps = {
  listing: ListingDetailDto
}

export function ListingDetailsCard({ listing }: ListingDetailsCardProps) {
  const locationLabel = listing.location.area
    ? `${listing.location.name}, ${listing.location.area}`
    : listing.location.name

  return (
    <Box rounded="2xl" borderWidth="1px" borderColor="blue.100" bg="white" p={{ base: "5", md: "6" }} boxShadow="sm">
      <Heading size="xl" mb="4">
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
      {listing.attributes.length > 0 && (
        <>
          <Separator mt="4" />
          <Heading size="xl" mb="4" mt="6" >
            Характеристики
          </Heading>
          <VStack gap="2" mt="4" align="stretch">
            {listing.attributes.map((attribute) => (
              <HStack key={attribute.id} gap="2">
                <Text fontSize="sm" color="gray.500">
                  {attribute.categoryAttributeName}
                </Text>
                <Text color="gray.400">•</Text>
                <Text>
                  {attribute.categoryAttributeValue}
                </Text>
              </HStack>
            ))}
          </VStack>
        </>
      )}
    </Box>
  )
}
