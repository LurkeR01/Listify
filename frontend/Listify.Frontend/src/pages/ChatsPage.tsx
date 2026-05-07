import { getChatHubUrl, getChatThreads } from "@/api/chat"
import { useAuth } from "@/auth/AuthContext"
import { ChatMessageList } from "@/components/chat/ChatMessageList"
import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import type { ChatThreadDto, ChatThreadMode } from "@/DTOs/Chat/ChatThreadDto"
import type { MessageDto } from "@/DTOs/Chat/MessageDto"
import type { ShortResponseUserDto } from "@/DTOs/Chat/ShortResponseUserDto"
import { footerGroups } from "@/data/home-content"
import { HubConnectionBuilder, LogLevel, type HubConnection } from "@microsoft/signalr"
import {
  Box,
  Button,
  Container,
  Grid,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  Link,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { IconType } from "react-icons"
import { FiInbox, FiMessageCircle, FiSend, FiShoppingBag, FiTag, FiUser } from "react-icons/fi"
import { Link as RouterLink, useNavigate } from "react-router-dom"

type HubReceiveMessageDto = {
  id?: string
  Id?: string
  text?: string
  Text?: string
  senderId?: string
  SenderId?: string
  createdAt?: string
  CreatedAt?: string
}

const modes: Array<{ value: ChatThreadMode; label: string; icon: IconType }> = [
  { value: "selling", label: "Продаю", icon: FiTag },
  { value: "buying", label: "Купую", icon: FiShoppingBag },
]

const normalizeId = (value: string | null | undefined) => String(value ?? "").trim().toLowerCase()

const getMessageDate = (message: MessageDto | null | undefined) => {
  const value = message?.createdAt
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

const sortMessagesByCreatedAt = (messages: MessageDto[]) => {
  return [...messages].sort((a, b) => getMessageDate(a) - getMessageDate(b))
}

const sortThreadsByUpdatedAt = (threads: ChatThreadDto[]) => {
  return [...threads].sort((a, b) => {
    const aTime = getMessageDate(a.lastMessage)
    const bTime = getMessageDate(b.lastMessage)
    return bTime - aTime
  })
}

const formatChatDate = (value: string | null | undefined) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  const today = new Date()
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()

  return date.toLocaleString("uk-UA", isToday ? { hour: "2-digit", minute: "2-digit" } : { day: "2-digit", month: "2-digit" })
}

const getPeer = (thread: ChatThreadDto, currentUserId?: string): ShortResponseUserDto => {
  const currentId = normalizeId(currentUserId)
  if (currentId && normalizeId(thread.seller.id) === currentId) return thread.buyer
  return thread.seller
}

const getUserName = (user: ShortResponseUserDto) => user.firstName.trim() || "Користувач"

const toHubMessage = (value: HubReceiveMessageDto | null | undefined) => {
  return {
    id: String(value?.id ?? value?.Id ?? ""),
    text: String(value?.text ?? value?.Text ?? ""),
    senderId: String(value?.senderId ?? value?.SenderId ?? ""),
    createdAt: String(value?.createdAt ?? value?.CreatedAt ?? ""),
  }
}

function ChatPreviewCard({
  thread,
  currentUserId,
  isSelected,
  onSelect,
}: {
  thread: ChatThreadDto
  currentUserId?: string
  isSelected: boolean
  onSelect: () => void
}) {
  const peer = getPeer(thread, currentUserId)
  const lastText = thread.lastMessage?.text.trim() || "Повідомлень ще немає"
  const dateLabel = formatChatDate(thread.lastMessage?.createdAt ?? thread.updatedAt)

  return (
    <Box
      w="full"
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect()
        }
      }}
      _hover={{ bg: "blue.50" }}
      _active={{ bg: "blue.100" }}
      bg={isSelected ? "blue.50" : "transparent"}
      cursor="pointer"
    >
      <HStack w="full" gap="3" align="start" px="3" py="3" textAlign="left">
        {thread.listingPreview.imageUrl ? (
          <Image
            src={thread.listingPreview.imageUrl}
            alt={thread.listingPreview.title}
            boxSize="14"
            rounded="md"
            objectFit="cover"
            flexShrink={0}
          />
        ) : (
          <Box
            boxSize="14"
            rounded="md"
            bg="gray.100"
            color="gray.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Icon as={FiTag} boxSize="5" />
          </Box>
        )}

        <Stack gap="1" minW="0" flex="1">
          <HStack justify="space-between" gap="2">
            <Text fontWeight="semibold" color="gray.900" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
              {getUserName(peer)}
            </Text>
            {dateLabel && (
              <Text fontSize="xs" color="gray.500" flexShrink={0}>
                {dateLabel}
              </Text>
            )}
          </HStack>

          <Link
            asChild
            fontSize="sm"
            color="blue.700"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            textDecoration="none"
            _hover={{ color: "blue.800", textDecoration: "underline" }}
            onClick={(event) => event.stopPropagation()}
          >
            <RouterLink to={`/listing/${thread.listingPreview.id}`}>{thread.listingPreview.title}</RouterLink>
          </Link>
          <Text fontSize="sm" color="gray.600" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            {lastText}
          </Text>
        </Stack>
      </HStack>
    </Box>
  )
}

export function ChatsPage() {
  const navigate = useNavigate()
  const { accessToken, isAuthenticated, user } = useAuth()
  const [mode, setMode] = useState<ChatThreadMode>("selling")
  const [threads, setThreads] = useState<ChatThreadDto[]>([])
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [draftText, setDraftText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hubError, setHubError] = useState<string | null>(null)
  const connectionRef = useRef<HubConnection | null>(null)

  const stopConnection = useCallback(async () => {
    const connection = connectionRef.current
    connectionRef.current = null
    if (!connection) return

    try {
      await connection.stop()
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    let isActive = true
    setIsLoading(true)
    setError(null)
    setSelectedThreadId(null)

    getChatThreads()
      .then((items) => {
        if (isActive) setThreads(items)
      })
      .catch((e) => {
        if (!isActive) return
        console.error("Failed to load chats:", e)
        setError("Не вдалося завантажити чати. Спробуйте оновити сторінку.")
        setThreads([])
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [isAuthenticated])

  useEffect(() => {
    setSelectedThreadId(null)
    setDraftText("")
    setHubError(null)
    void stopConnection()
  }, [mode, stopConnection])

  useEffect(() => {
    return () => {
      void stopConnection()
    }
  }, [stopConnection])

  const filteredThreads = useMemo(() => {
    const currentUserId = normalizeId(user?.id)
    const visibleThreads = threads.filter((thread) => {
      if (!currentUserId) return false
      return mode === "selling" ? normalizeId(thread.seller.id) === currentUserId : normalizeId(thread.buyer.id) === currentUserId
    })

    return sortThreadsByUpdatedAt(visibleThreads)
  }, [mode, threads, user?.id])

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [selectedThreadId, threads],
  )

  const openThread = useCallback(
    async (thread: ChatThreadDto) => {
      setSelectedThreadId(thread.id)
      setDraftText("")
      setHubError(null)
      await stopConnection()

      if (!accessToken) {
        setHubError("Не вдалося підключитися до чату")
        return
      }

      const connection = new HubConnectionBuilder()
        .withUrl(getChatHubUrl(), {
          accessTokenFactory: () => accessToken,
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build()

      connectionRef.current = connection

      connection.on("ReceiveMessage", (payload: HubReceiveMessageDto) => {
        const hubMessage = toHubMessage(payload)
        if (!hubMessage.id) return

        setThreads((currentThreads) =>
          currentThreads.map((currentThread) => {
            if (currentThread.id !== thread.id) return currentThread
            if (currentThread.messages.some((message) => message.id === hubMessage.id)) return currentThread

            const sender =
              normalizeId(currentThread.buyer.id) === normalizeId(hubMessage.senderId)
                ? currentThread.buyer
                : normalizeId(currentThread.seller.id) === normalizeId(hubMessage.senderId)
                ? currentThread.seller
                : { id: hubMessage.senderId, firstName: "Користувач" }

            const message: MessageDto = {
              id: hubMessage.id,
              text: hubMessage.text,
              sender,
              createdAt: hubMessage.createdAt,
              imageUrl: undefined,
              imageName: undefined,
            }
            const messages = sortMessagesByCreatedAt([...currentThread.messages, message])

            return {
              ...currentThread,
              messages,
              lastMessage: messages.at(-1) ?? null,
              updatedAt: message.createdAt,
            }
          }),
        )
      })

      connection.onreconnected(async () => {
        try {
          await connection.invoke("JoinChat", thread.id)
        } catch {
          // ignore
        }
      })

      try {
        await connection.start()
        await connection.invoke("JoinChat", thread.id)
      } catch (e) {
        console.error("Failed to connect to chat hub:", e)
        setHubError("Не вдалося підключитися до чату. Спробуйте відкрити його ще раз.")
        void stopConnection()
      }
    },
    [accessToken, stopConnection],
  )

  const sendMessage = useCallback(async () => {
    const text = draftText.trim()
    if (!text || !selectedThread || !connectionRef.current || isSending) return

    setIsSending(true)
    setHubError(null)
    try {
      await connectionRef.current.invoke("SendMessage", selectedThread.id, text)
      setDraftText("")
    } catch (e) {
      console.error("Failed to send chat page message:", e)
      setHubError("Не вдалося надіслати повідомлення. Спробуйте ще раз.")
    } finally {
      setIsSending(false)
    }
  }, [draftText, isSending, selectedThread])

  if (!isAuthenticated) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
        <Header />
        <Box flex="1">
          <Container maxW="4xl" py={{ base: "8", md: "12" }}>
            <Box rounded="xl" borderWidth="1px" borderColor="blue.100" bg="white" p={{ base: "5", md: "8" }} boxShadow="sm">
              <Stack gap="4" textAlign="center" align="center">
                <Icon as={FiMessageCircle} boxSize="9" color="blue.500" />
                <Heading size="md">Чати недоступні</Heading>
                <Text color="gray.600">Увійдіть в акаунт, щоб переглядати свої повідомлення.</Text>
                <Button colorPalette="blue" onClick={() => navigate("/auth")}>
                  Увійти
                </Button>
              </Stack>
            </Box>
          </Container>
        </Box>
        <Footer groups={footerGroups} />
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      <Header />

      <Box flex="1">
        <Container maxW="9xl" py={{ base: "6", md: "8" }}>
          <Stack gap="5">
            <Stack gap="1">
              <Heading size={{ base: "lg", md: "xl" }} color="gray.900">
                Чати
              </Heading>
              <Text color="gray.600">Повідомлення щодо ваших покупок і продажів.</Text>
            </Stack>

            <Grid templateColumns={{ base: "1fr", lg: "360px minmax(0, 1fr)" }} gap="5" alignItems="stretch">
              <Box
                bg="white"
                borderWidth="1px"
                borderColor="blue.100"
                rounded="xl"
                overflow="hidden"
                boxShadow="sm"
                minH={{ base: "360px", lg: "640px" }}
              >
                <Stack gap="0" h="100%">
                  <Box px="4" py="4" borderBottomWidth="1px" borderColor="blue.100">
                    <HStack bg="gray.100" rounded="lg" p="1" gap="1">
                      {modes.map((item) => {
                        const isActive = item.value === mode
                        return (
                          <Button
                            key={item.value}
                            size="sm"
                            flex="1"
                            variant={isActive ? "solid" : "ghost"}
                            colorPalette={isActive ? "blue" : "gray"}
                            onClick={() => setMode(item.value)}
                          >
                            <Icon as={item.icon} />
                            {item.label}
                          </Button>
                        )
                      })}
                    </HStack>
                  </Box>

                  <Box flex="1" overflowY="auto">
                    {isLoading && (
                      <HStack justify="center" py="10">
                        <Spinner color="blue.500" />
                      </HStack>
                    )}

                    {!isLoading && error && (
                      <Stack gap="2" py="8" px="4" textAlign="center" align="center">
                        <Icon as={FiInbox} boxSize="7" color="red.400" />
                        <Text color="red.600" fontSize="sm">
                          {error}
                        </Text>
                      </Stack>
                    )}

                    {!isLoading && !error && filteredThreads.length === 0 && (
                      <Stack gap="2" py="10" px="4" textAlign="center" align="center">
                        <Icon as={FiInbox} boxSize="8" color="blue.400" />
                        <Text color="gray.700" fontWeight="medium">
                          Чатів поки немає
                        </Text>
                        <Text color="gray.500" fontSize="sm">
                          Тут з'являться діалоги з покупцями та продавцями.
                        </Text>
                      </Stack>
                    )}

                    {!isLoading &&
                      !error &&
                      filteredThreads.map((thread) => (
                        <ChatPreviewCard
                          key={thread.id}
                          thread={thread}
                          currentUserId={user?.id}
                          isSelected={thread.id === selectedThreadId}
                          onSelect={() => void openThread(thread)}
                        />
                      ))}
                  </Box>
                </Stack>
              </Box>

              <Box
                bg="white"
                borderWidth="1px"
                borderColor="blue.100"
                rounded="xl"
                overflow="hidden"
                boxShadow="sm"
                minH={{ base: "420px", lg: "640px" }}
              >
                {selectedThread ? (
                  <Stack h="100%" gap="0">
                    <HStack px="5" py="4" borderBottomWidth="1px" borderColor="blue.100" justify="space-between">
                      <HStack gap="3" minW="0">
                        <Box
                          boxSize="10"
                          rounded="full"
                          bg="blue.50"
                          color="blue.600"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          flexShrink={0}
                        >
                          <Icon as={FiUser} boxSize="5" />
                        </Box>
                        <Stack gap="0" minW="0">
                          <Text fontWeight="semibold" color="gray.900" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                            {getUserName(getPeer(selectedThread, user?.id))}
                          </Text>
                          <Text fontSize="sm" color="blue.700" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                            {selectedThread.listingPreview.title}
                          </Text>
                        </Stack>
                      </HStack>
                    </HStack>

                    {hubError && (
                      <Box px="5" py="2" bg="red.50" borderBottomWidth="1px" borderColor="red.100">
                        <Text fontSize="sm" color="red.600">
                          {hubError}
                        </Text>
                      </Box>
                    )}

                    <Box flex="1" overflowY="auto" px={{ base: "4", md: "5" }} py="4" bg="white">
                      {selectedThread.messages.length > 0 ? (
                        <ChatMessageList messages={selectedThread.messages} currentUserId={user?.id} />
                      ) : (
                        <Stack h="100%" minH="360px" align="center" justify="center" textAlign="center" gap="3">
                          <Icon as={FiMessageCircle} boxSize="10" color="blue.400" />
                          <Heading size="sm" color="gray.800">
                            У цьому чаті ще немає повідомлень
                          </Heading>
                        </Stack>
                      )}
                    </Box>

                    <Box borderTopWidth="1px" borderColor="blue.100" bg="white" px={{ base: "4", md: "5" }} py="3">
                      <HStack gap="2">
                        <Input
                          placeholder="Повідомлення..."
                          value={draftText}
                          disabled={isSending}
                          onChange={(e) => setDraftText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              void sendMessage()
                            }
                          }}
                        />
                        <IconButton
                          aria-label="Надіслати"
                          colorPalette="blue"
                          onClick={() => void sendMessage()}
                          disabled={!draftText.trim() || isSending}
                          loading={isSending}
                        >
                          <Icon as={FiSend} boxSize="5" />
                        </IconButton>
                      </HStack>
                    </Box>
                  </Stack>
                ) : (
                  <Stack h="100%" minH={{ base: "420px", lg: "640px" }} align="center" justify="center" textAlign="center" gap="3" px="6">
                    <Icon as={FiMessageCircle} boxSize="12" color="blue.400" />
                    <Heading size="md" color="gray.900">
                      Оберіть чат
                    </Heading>
                    <Text color="gray.600">Виберіть діалог зі списку, щоб прочитати повідомлення.</Text>
                  </Stack>
                )}
              </Box>
            </Grid>
          </Stack>
        </Container>
      </Box>

      <Footer groups={footerGroups} />
    </Box>
  )
}
