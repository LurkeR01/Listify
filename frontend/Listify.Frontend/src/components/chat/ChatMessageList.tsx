import { Avatar, Box, HStack, Image, Stack, Text } from "@chakra-ui/react"
import type { MessageDto } from "@/DTOs/Chat/MessageDto"

type ChatMessageListProps = {
  messages: MessageDto[]
  currentUserId?: string
}

const formatMessageTime = (value: string | null | undefined) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export function ChatMessageList({ messages, currentUserId }: ChatMessageListProps) {
  const normalizedCurrentUserId = String(currentUserId ?? "")
    .trim()
    .toLowerCase()

  return (
    <Stack gap="3">
      {messages.map((m) => {
        const normalizedSenderId = String(m.sender.id ?? "")
          .trim()
          .toLowerCase()

        const isMine = Boolean(normalizedCurrentUserId) && normalizedSenderId === normalizedCurrentUserId
        const senderName = (m.sender.firstName || "Користувач").trim()
        const timeLabel = formatMessageTime(m.createdAt)

        return (
          <Box key={m.id} alignSelf={isMine ? "flex-end" : "flex-start"} maxW="85%">
            <HStack gap="2" mb="1" justify={isMine ? "flex-end" : "flex-start"}>
              {!isMine && (
                <Avatar.Root size="xs" bg="blue.100" color="blue.700">
                  {m.sender.avatarUrl ? <Avatar.Image src={m.sender.avatarUrl} alt={senderName} /> : <Avatar.Fallback name={senderName} />}
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

              {isMine && (
                <Avatar.Root size="xs" bg="blue.100" color="blue.700">
                  {m.sender.avatarUrl ? <Avatar.Image src={m.sender.avatarUrl} alt={senderName} /> : <Avatar.Fallback name={senderName || "Ви"} />}
                </Avatar.Root>
              )}
            </HStack>

            <Box
              bg={isMine ? "blue.50" : "gray.100"}
              borderWidth="1px"
              borderColor={isMine ? "blue.100" : "gray.200"}
              color="gray.900"
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
      })}
    </Stack>
  )
}
