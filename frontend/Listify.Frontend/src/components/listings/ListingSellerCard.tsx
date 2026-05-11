import { Avatar, Box, Button, Heading, HStack, Icon, List, Separator, Stack, Text } from "@chakra-ui/react"
import { Link } from "react-router-dom"
import { LuMail, LuMessageCircle, LuPhone, LuStar } from "react-icons/lu"
import type { ResponseUserDto } from "@/DTOs/User/UserDto"
import { useListingChatOverlay } from "@/hooks/useListingChatOverlay"
import { useAuth } from "@/auth/AuthContext"
import { useState, useEffect } from "react"
import { getConversation } from "@/api/chat"
import { Tooltip } from "@/components/ui/tooltip"
import { RatingModal } from "@/components/common/RatingModal"
import { rateUser, getUserRatingForListing } from "@/api/user"

type ListingSellerCardProps = {
  seller: ResponseUserDto
  listingId: string
}

export function ListingSellerCard({ seller, listingId }: ListingSellerCardProps) {
  const displayName = [seller.firstName, seller.lastName].filter(Boolean).join(" ").trim() || seller.username || "Користувач"
  const sellerPhone = seller.phoneNumber?.trim()

  const [isPhoneVisible, setIsPhoneVisible] = useState(false)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [messagesCount, setMessagesCount] = useState(0)
  const [isLoadingChat, setIsLoadingChat] = useState(true)
  const [isRated, setIsRated] = useState(false) 
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const { openChat, overlay } = useListingChatOverlay()
  const { user } = useAuth()
  const isOwnListing = Boolean(user && user.id === seller.id)

  // 1. ПЕРЕВІРКА ІСНУЮЧОГО РЕЙТИНГУ (Один раз при завантаженні)
  useEffect(() => {
    async function checkExistingRating() {
      if (!user) {
        setIsInitialLoading(false)
        return
      }
      try {
        const rating = await getUserRatingForListing(listingId)
        if (rating) setIsRated(true)
      } catch (e) {
        // 404 або помилка означає, що рейтингу немає — залишаємо isRated = false
        console.log("Рейтинг не знайдено або помилка")
      } finally {
        setIsInitialLoading(false)
      }
    }
    checkExistingRating()
  }, [user, listingId])

  // 2. ОПИТУВАННЯ ЧАТУ (Polling для активації кнопки в реальному часі)
  useEffect(() => {
    if (!user || isOwnListing || isRated) {
      setIsLoadingChat(false)
      return
    }

    const fetchChatStatus = async () => {
      try {
        const conversation = await getConversation({ listingId, sellerId: seller.id })
        const sellerMsgs = conversation.lastMessages.filter(
          (msg) => msg.sender.id.toLowerCase() === seller.id.toLowerCase()
        )
        setMessagesCount(sellerMsgs.length)
      } catch (e) {
        console.error("Помилка оновлення чату", e)
      } finally {
        setIsLoadingChat(false)
      }
    }

    fetchChatStatus() // Викликаємо відразу

    // Опитуємо сервер кожні 5 секунд, якщо повідомлень ще мало (< 5)
    const interval = setInterval(() => {
      if (messagesCount < 5) {
        fetchChatStatus()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [user, seller.id, listingId, isRated, messagesCount, isOwnListing])

  const isEligible = messagesCount > 4
  const isButtonDisabled = !user || isOwnListing || !isEligible

  const getTooltipLabel = () => {
    if (!user) return "Увійдіть в акаунт, щоб залишити відгук"
    if (isOwnListing) return "Ви не можете оцінювати власне оголошення"
    if (!isEligible) return `Потрібно принаймні 5 повідомлень від продавця (зараз: ${messagesCount})`
    return ""
  }

  const handleRatingSubmit = async (data: { rating: number; comment: string }) => {
    try {
      const dto = {
        RatedUserId: seller.id,
        ListingId: listingId,
        Rating: data.rating,
        Comment: data.comment
      }
      await rateUser(dto)
      setIsRatingModalOpen(false)
      setIsRated(true) // Кнопка зникне відразу після успішної оцінки
    } catch (e) {
      console.error("Помилка при відправці рейтингу", e)
    }
  }

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
            <Link to={`/user-profile/${seller.id}`} style={{ display: "inline-block" }}>
              <Avatar.Root size="xl" bg="blue.100" color="blue.700" style={{ cursor: "pointer" }}>
                {seller.avatarUrl ? <Avatar.Image src={seller.avatarUrl} alt={displayName} /> : <Avatar.Fallback name={displayName} />}
              </Avatar.Root>
            </Link>
            <Heading size="sm">{displayName}</Heading>
            <HStack gap="1" color="gray.600">
              <Icon as={LuStar} boxSize="4" color="yellow.400" fill="currentColor" />
              <Text fontSize="sm" fontWeight="medium">4.8</Text>
            </HStack>
          </Stack>

          <Separator />

          <Stack gap="3">
            <Button
              disabled={!user || isOwnListing}
              colorPalette="blue"
              size="lg"
              gap="2"
              onClick={() => openChat({ listingId, sellerId: seller.id })}
            >
              <Icon as={LuMessageCircle} boxSize="4" />
              Написати
            </Button>

            {/* Кнопка завжди видима, доки не отримано статус isRated */}
            {!isInitialLoading && !isRated && (
              <Tooltip content={getTooltipLabel()} disabled={!getTooltipLabel()} showArrow>
                <Box w="full">
                  <Button
                    variant="subtle"
                    colorPalette="yellow"
                    size="lg"
                    gap="2"
                    w="full"
                    disabled={isButtonDisabled}
                    loading={isLoadingChat && messagesCount === 0}
                    onClick={() => setIsRatingModalOpen(true)}
                    _disabled={{
                      opacity: 0.6,
                      cursor: "not-allowed"
                    }}
                  >
                    <Icon as={LuStar} boxSize="4" fill={isEligible ? "currentColor" : "none"} />
                    Оцінити продавця
                  </Button>
                </Box>
              </Tooltip>
            )}

            <RatingModal 
              isOpen={isRatingModalOpen} 
              onClose={() => setIsRatingModalOpen(false)} 
              onSubmit={handleRatingSubmit}
            />

            <Button
              variant="outline"
              colorPalette="blue"
              size="lg"
              gap="2"
              disabled={!user || isOwnListing || !sellerPhone}
              onClick={() => setIsPhoneVisible(true)}
            >
              <Icon as={LuPhone} boxSize="4" />
              {isPhoneVisible ? "+38" + sellerPhone : sellerPhone ? "Показати телефон" : "Телефон не вказано"}
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