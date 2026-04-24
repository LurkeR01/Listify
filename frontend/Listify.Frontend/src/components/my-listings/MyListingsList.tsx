import { Box, Stack, Text } from "@chakra-ui/react"
import { ListingItemCard } from "./ListingItemCard"
import type { ListingDto } from "@/DTOs/Listing/ListingDto"
import type { ListingStatus } from "@/data/home-content"


type MyListingsListProps = {
  listings: ListingDto[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, status: ListingStatus) => void
}

export function MyListingsList({
  listings,
  onEdit,
  onDelete,
  onToggleStatus,
}: MyListingsListProps) {
  return (
    <>
      <Text fontWeight="medium" color="gray.700">
        Знайдено {listings.length} оголошень
      </Text>

      <Stack gap="4">
        {listings.length > 0 ? (
          listings.map((listing) => (
            <ListingItemCard
              key={listing.id}
              listing={listing}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))
        ) : (
          <Box
            py="20"
            textAlign="center"
            bg="white"
            rounded="2xl"
            borderStyle="dashed"
            borderWidth="2px"
          >
            <Text color="gray.400" fontSize="lg">
              Оголошень не знайдено
            </Text>
          </Box>
        )}
      </Stack>
    </>
  )
}
