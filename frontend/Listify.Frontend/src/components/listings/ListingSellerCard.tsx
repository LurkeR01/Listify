import { Avatar, Box, Button, Heading, HStack, Icon, List, Separator, Stack, Text } from "@chakra-ui/react"
import { LuMail, LuMessageCircle, LuPhone, LuStar } from "react-icons/lu"
import type { ResponseUserDto } from "@/DTOs/User/UserDto"
import { useListingChatOverlay } from "@/hooks/useListingChatOverlay"
import { useAuth } from "@/auth/AuthContext"
import { useState } from "react"

type ListingSellerCardProps = {
  seller: ResponseUserDto
  listingId: string
}

export function ListingSellerCard({ seller, listingId }: ListingSellerCardProps) {
  const displayName = [seller.firstName, seller.lastName].filter(Boolean).join(" ").trim() || seller.username || "Користувач"
  const sellerPhone = seller.phoneNumber?.trim()
  const [isPhoneVisible, setIsPhoneVisible] = useState(false)
  const { openChat, overlay } = useListingChatOverlay()
  const { user } = useAuth()
  const isOwnListing = Boolean(user && user.id === seller.id)

  return (
    <>
      <Box
        rounded="2xl"
        borderWidth="1px"
        borderColor="blue.100"
        bg="white"
        p={{ base: "5", md: "6" }}
        boxShadow="sm"
        position={{ base: "static", lg: "sticky" }}
        top="96px"
      >
        <Stack gap="4">
          <Stack align="center" textAlign="center" gap="2">
            <Avatar.Root size="xl" bg="blue.100" color="blue.700">
              {seller.avatarUrl ? <Avatar.Image src={seller.avatarUrl} alt={displayName} /> : <Avatar.Fallback name={displayName} />}
            </Avatar.Root>
            <Heading size="sm">{displayName}</Heading>
            <HStack gap="1" color="gray.600">
              <Icon as={LuStar} boxSize="4" color="yellow.400" />
            </HStack>
          </Stack>

          <Separator />

          <Stack gap="3">
            <Button
              colorPalette="blue"
              size="lg"
              gap="2"
              disabled={!user || isOwnListing || !sellerPhone}
              onClick={() => setIsPhoneVisible(true)}
            >
              <Icon as={LuPhone} boxSize="4" />
              {isPhoneVisible ? sellerPhone : sellerPhone ? "Показати телефон" : "Телефон не вказано"}
            </Button>
            <Button
              variant="outline"
              disabled={!user || isOwnListing}
              colorPalette="blue"
              size="lg"
              gap="2"
              onClick={() => openChat({ listingId, sellerId: seller.id })}
            >
              <Icon as={LuMessageCircle} boxSize="4" />
              Написати
            </Button>
            <Button variant="outline" disabled={!user || isOwnListing} colorPalette="blue" size="lg" gap="2">
              <Icon as={LuMail} boxSize="4" />
              Email продавцю
            </Button>
          </Stack>

          <Separator />

          <Stack gap="2">
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Поради з безпеки
            </Text>
            <List.Root display="grid" gap="1" fontSize="xs" color="gray.600" listStylePosition="inside">
              <List.Item>Зустрічайтеся у публічних місцях</List.Item>
              <List.Item>Перевіряйте товар перед оплатою</List.Item>
              <List.Item>Розрахунок після огляду</List.Item>
            </List.Root>
          </Stack>
        </Stack>
      </Box>
      {overlay}
    </>
  )
}
