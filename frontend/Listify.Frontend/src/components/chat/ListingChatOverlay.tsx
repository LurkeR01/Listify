import { Box, Button, HStack, Heading, Icon, IconButton, Image, Input, Spinner, Stack, Text } from "@chakra-ui/react"
import { LuSend, LuX } from "react-icons/lu"
import { useState } from "react"
import type { ConversationDto } from "@/DTOs/Chat/ConversationDto"
import type { MessageDto } from "@/DTOs/Chat/MessageDto"
import { ChatMessageList } from "@/components/chat/ChatMessageList"

type ListingChatOverlayProps = {
  isOpen: boolean
  isLoading: boolean
  error: string | null
  conversation: ConversationDto | null
  messages: MessageDto[]
  currentUserId?: string
  onClose: () => void
  onSendMessage: (payload: { text: string }) => boolean | Promise<boolean>
}

export function ListingChatOverlay({
  isOpen,
  isLoading,
  error,
  conversation,
  messages,
  currentUserId,
  onClose,
  onSendMessage,
}: ListingChatOverlayProps) {
  const listingTitle = conversation?.listingPreview.title ?? "Чат"
  const listingPrice = conversation ? `${new Intl.NumberFormat("uk-UA").format(conversation.listingPreview.price)} грн` : ""
  const listingLocation = conversation?.listingPreview.location?.name ?? ""

  const [draftText, setDraftText] = useState("")
  const [isSending, setIsSending] = useState(false)

  const canSend = draftText.trim().length > 0 && !isSending

  const handleSend = async () => {
    if (!canSend) return
    setIsSending(true)
    try {
      const sent = await onSendMessage({ text: draftText })
      if (sent) setDraftText("")
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) return null

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

          {!isLoading &&
            !error &&
            conversation &&
            (messages.length === 0 ? (
              <Text color="gray.600" fontSize="sm" textAlign="center" py="6">
                Повідомлень ще немає. Напишіть продавцю в чаті.
              </Text>
            ) : (
              <ChatMessageList messages={messages} currentUserId={currentUserId} />
            ))}
        </Box>

        <Box borderTopWidth="1px" borderColor="blue.100" bg="white" px="4" py="3">
          <HStack gap="2">
            <Input
              placeholder="Повідомлення..."
              value={draftText}
              disabled={isSending}
              onChange={(e) => setDraftText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  void handleSend()
                }
              }}
            />

            <IconButton
              aria-label="Надіслати"
              colorPalette="blue"
              onClick={() => void handleSend()}
              disabled={!canSend}
              loading={isSending}
            >
              <Icon as={LuSend} boxSize="5" />
            </IconButton>
          </HStack>
        </Box>
      </Stack>
    </Box>
  )
}
