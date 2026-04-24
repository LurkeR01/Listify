import { Box, Image, Stack, Text } from "@chakra-ui/react"
import type { ListingDto } from "@/DTOs/Listing/ListingDto"
import { useNavigate } from "react-router-dom"

type ListingCardProps = {
  listing: ListingDto
}

export function ListingCard({ listing }: ListingCardProps) {
  const formattedPrice = `${new Intl.NumberFormat("uk-UA").format(listing.price)} грн`
  const navigate = useNavigate()

  return (
    <Box
      rounded="2xl"
      borderWidth="1px"
      borderColor="blue.100"
      bg="white"
      overflow="hidden"
      boxShadow="sm"
      transition="all 0.25s ease"
      onClick={() => navigate(`/listing/${listing.id}`)}
      _hover={{ borderColor: "blue.300", transform: "translateY(-3px)", boxShadow: "lg" }}
    >
      <Box h="180px" bg="linear-gradient(135deg, #ebf8ff 0%, #dbeafe 100%)">
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            w="full"
            h="full"
            objectFit="cover"
            loading="lazy"
          />
        ) : null}
      </Box>
      <Stack p="4" gap="2">
        <Text fontWeight="semibold" color="gray.900" lineClamp="2">
          {listing.title}
        </Text>
        <Text fontSize="xl" fontWeight="bold" color="blue.700">
          {formattedPrice}
        </Text>
        <Text color="gray.600" fontSize="sm">
          {listing.location.name + ", " + listing.location.area}
        </Text>
      </Stack>
    </Box>
  )
}
