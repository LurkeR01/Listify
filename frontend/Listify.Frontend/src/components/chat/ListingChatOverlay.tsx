import { Avatar, Box, Button, HStack, Heading, Icon, IconButton, Image, Input, Spinner, Stack, Text } from "@chakra-ui/react"
import { LuImagePlus, LuSend, LuX } from "react-icons/lu"
import { useEffect, useMemo, useRef, useState } from "react"
import type { ConversationDto } from "@/DTOs/Chat/ConversationDto"

type ListingChatOverlayProps = {
  isOpen: boolean
  isLoading: boolean
  error: string | null
  conversation: ConversationDto | null
  currentUserId?: string
  onClose: () => void
  onSendMessage: (payload: { text: string; image?: File | null }) => void
}

export function ListingChatOverlay({
  isOpen,
  isLoading,
  error,
  conversation,
  currentUserId,
  onClose,
  onSendMessage,
}: ListingChatOverlayProps) {
  if (!isOpen) return null

  const listingTitle = conversation?.listingPreview.title ?? "Чат"
  const listingPrice = conversation ? `${new Intl.NumberFormat("uk-UA").format(conversation.listingPreview.price)} грн` : ""
  const listingLocation = conversation?.listingPreview.location?.name ?? ""

  const [draftText, setDraftText] = useState("")
  const [draftImage, setDraftImage] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const draftImagePreviewUrl = useMemo(() => {
    if (!draftImage) return null
    return URL.createObjectURL(draftImage)
  }, [draftImage])

  useEffect(() => {
    return () => {
      if (draftImagePreviewUrl) URL.revokeObjectURL(draftImagePreviewUrl)
    }
  }, [draftImagePreviewUrl])

  const canSend = draftText.trim().length > 0 || !!draftImage

  const clearDraft = () => {
    setDraftText("")
    setDraftImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSend = () => {
    if (!canSend) return
    onSendMessage({ text: draftText, image: draftImage })
    clearDraft()
  }

  return (
    <Box
      position="fixed"
      right={{ base: "3", md: "5" }}
      bottom={{ base: "3", md: "5" }}
      zIndex="popover"
      w={{ base: "calc(100vw - 24px)", sm: "380px" }}
      maxW="420px"
      h={{ base: "70vh", sm: "520px" }}
      bg="white"
      borderWidth="1px"
      borderColor="blue.100"
      rounded="2xl"
      overflow="hidden"
      boxShadow="xl"
    >
      <Stack h="100%" gap="0">
        <HStack px="4" py="3" borderBottomWidth="1px" borderColor="blue.100" bg="white" justify="space-between">
          <HStack gap="3" minW="0">
            {conversation?.listingPreview.imageUrl ? (
              <Image
                src={conversation.listingPreview.imageUrl}
                alt={listingTitle}
                w="40px"
                h="40px"
                objectFit="cover"
                rounded="lg"
              />
            ) : (
              <Box w="40px" h="40px" rounded="lg" bg="blue.50" borderWidth="1px" borderColor="blue.100" />
            )}
            <Box minW="0">
              <Heading size="sm" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                {listingTitle}
              </Heading>
              {conversation && (
                <Text fontSize="xs" color="gray.600" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                  {listingPrice}
                  {listingLocation ? ` • ${listingLocation}` : ""}
                </Text>
              )}
            </Box>
          </HStack>
          <IconButton aria-label="Закрити чат" variant="ghost" onClick={onClose}>
            <Icon as={LuX} boxSize="5" />
          </IconButton>
        </HStack>

        <Box flex="1" overflowY="auto" px="4" py="3" bg="white">
          {isLoading && (
            <HStack justify="center" py="6">
              <Spinner size="md" color="blue.500" />
            </HStack>
          )}

          {!isLoading && error && (
            <Stack gap="2" py="6" textAlign="center">
              <Text color="red.600" fontSize="sm">
                {error}
              </Text>
              <Button size="sm" variant="outline" colorPalette="blue" onClick={onClose}>
                Закрити
              </Button>
            </Stack>
          )}

          {!isLoading && !error && conversation && (
            <Stack gap="3">
              {conversation.lastMessages.length === 0 ? (
                <Text color="gray.600" fontSize="sm" textAlign="center" py="6">
                  Повідомлень ще немає. Напишіть продавцю в чаті.
                </Text>
              ) : (
                conversation.lastMessages.map((m) => {
                  const isMine = currentUserId && m.sender.id === currentUserId
                  const senderName = (m.sender.firstName || "Користувач").trim()
                  const timeLabel = m.createdAt
                    ? new Date(m.createdAt).toLocaleString("uk-UA", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
                    : ""
                  return (
                    <Box key={m.id} alignSelf={isMine ? "flex-end" : "flex-start"} maxW="85%">
                      <HStack gap="2" mb="1" justify={isMine ? "flex-end" : "flex-start"}>
                        {!isMine && (
                          <Avatar.Root size="xs" bg="blue.100" color="blue.700">
                            {m.sender.avatarUrl ? (
                              <Avatar.Image src={m.sender.avatarUrl} alt={senderName} />
                            ) : (
                              <Avatar.Fallback name={senderName} />
                            )}
                          </Avatar.Root>
                        )}
                        <Text fontSize="xs" color="gray.600">
                          {isMine ? "Ви" : senderName}
                        </Text>
                        {timeLabel && (
                          <Text fontSize="xs" color="gray.500">
                            • {timeLabel}
                          </Text>
                        )}
                      </HStack>
                      <Box
                        bg={isMine ? "blue.600" : "gray.100"}
                        color={isMine ? "white" : "gray.900"}
                        px="3"
                        py="2"
                        rounded="xl"
                      >
                        {m.imageUrl && (
                          <Image src={m.imageUrl} alt={m.imageName ?? "image"} rounded="lg" mb="2" maxH="220px" objectFit="cover" />
                        )}
                        <Text fontSize="sm" whiteSpace="pre-wrap">
                          {m.text}
                        </Text>
                      </Box>
                    </Box>
                  )
                })
              )}
            </Stack>
          )}
        </Box>

        <Box borderTopWidth="1px" borderColor="blue.100" bg="white" px="4" py="3">
          <Stack gap="2">
            {draftImagePreviewUrl && (
              <HStack gap="3" align="start">
                <Image src={draftImagePreviewUrl} alt={draftImage?.name ?? "draft"} w="72px" h="72px" objectFit="cover" rounded="lg" />
                <Stack gap="1" flex="1">
                  <Text fontSize="sm" fontWeight="medium" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                    {draftImage?.name ?? "image"}
                  </Text>
                  <Button size="xs" variant="outline" colorPalette="blue" alignSelf="start" onClick={() => setDraftImage(null)}>
                    Прибрати
                  </Button>
                </Stack>
              </HStack>
            )}

            <HStack gap="2">
              <IconButton
                aria-label="Додати зображення"
                variant="outline"
                colorPalette="blue"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon as={LuImagePlus} boxSize="5" />
              </IconButton>

              <Input
                placeholder="Повідомлення…"
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />

              <IconButton
                aria-label="Надіслати"
                colorPalette="blue"
                onClick={handleSend}
                disabled={!canSend}
              >
                <Icon as={LuSend} boxSize="5" />
              </IconButton>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  setDraftImage(file)
                }}
              />
            </HStack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}
