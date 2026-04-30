import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { HubConnectionBuilder, LogLevel, type HubConnection } from "@microsoft/signalr"
import { connectConversation, type RequestConnectionDto } from "@/api/chat"
import type { ConversationDto } from "@/DTOs/Chat/ConversationDto"
import { useAuth } from "@/auth/AuthContext"
import api from "@/api/axios"
import { ListingChatOverlay } from "@/components/chat/ListingChatOverlay"
import { useNavigate } from "react-router-dom"
import type { MessageDto } from "@/DTOs/Chat/MessageDto"

type UseListingChatOverlayResult = {
  openChat: (dto: RequestConnectionDto) => Promise<void>
  closeChat: () => void
  overlay: ReactNode
  isOpen: boolean
}

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

const getHubUrl = (): string => {
  const base = String(api.defaults.baseURL ?? "").trim()
  if (!base) return "/chat"
  return base.replace(/\/api\/?$/i, "") + "/chat"
}

const toHubMessage = (value: HubReceiveMessageDto | null | undefined) => {
  return {
    id: String(value?.id ?? value?.Id ?? ""),
    text: String(value?.text ?? value?.Text ?? ""),
    senderId: String(value?.senderId ?? value?.SenderId ?? ""),
    createdAt: String(value?.createdAt ?? value?.CreatedAt ?? ""),
  }
}

const normalizeId = (value: string | null | undefined) => String(value ?? "").trim().toLowerCase()

export function useListingChatOverlay(): UseListingChatOverlayResult {
  const { accessToken, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversation, setConversation] = useState<ConversationDto | null>(null)
  const [messages, setMessages] = useState<MessageDto[]>([])

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

  const closeChat = useCallback(() => {
    setIsOpen(false)
    setIsLoading(false)
    setError(null)
    setConversation(null)
    setMessages([])
    void stopConnection()
  }, [stopConnection])

  const sendMessage = useCallback(
    async (payload: { text: string; image?: File | null }) => {
      const text = payload.text ?? ""
      if (!text.trim()) return
      if (!connectionRef.current || !conversation) return

      try {
        await connectionRef.current.invoke("SendMessage", conversation.id, text.trim())
      } catch (e) {
        const message = e instanceof Error ? e.message : "Не вдалося надіслати повідомлення"
        setError(message)
      }
    },
    [conversation],
  )

  const openChat = useCallback(
    async (dto: RequestConnectionDto) => {
      if (!isAuthenticated || !accessToken) {
        navigate("/auth")
        return
      }

      setIsOpen(true)
      setIsLoading(true)
      setError(null)

      try {
        const conv = await connectConversation(dto)
        setConversation(conv)
        setMessages(conv.lastMessages)

        const hubUrl = getHubUrl()
        const connection = new HubConnectionBuilder()
          .withUrl(hubUrl, {
            accessTokenFactory: () => accessToken,
          })
          .withAutomaticReconnect()
          .configureLogging(LogLevel.Information)
          .build()

        connectionRef.current = connection

        connection.on("ReceiveMessage", (payload: HubReceiveMessageDto) => {
          const hubMessage = toHubMessage(payload)
          if (!hubMessage.id) return

          const normalizedSenderId = normalizeId(hubMessage.senderId)
          const normalizedCurrentUserId = normalizeId(user?.id)

          const knownSender =
            conv.participants.find((p) => normalizeId(p.id) === normalizedSenderId) ??
            (user && normalizedSenderId && normalizedSenderId === normalizedCurrentUserId
              ? {
                  id: user.id ?? hubMessage.senderId,
                  firstName: user.firstName ?? "",
                  avatarUrl: user.avatarUrl ?? undefined,
                  avatarPublicId: user.avatarPublicId ?? undefined,
                }
              : undefined)

          const message: MessageDto = {
            id: hubMessage.id,
            text: hubMessage.text,
            sender: knownSender ?? { id: hubMessage.senderId, firstName: "Користувач" },
            createdAt: hubMessage.createdAt,
            imageUrl: undefined,
            imageName: undefined,
          }

          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) return prev
            return [...prev, message]
          })
        })

        connection.onreconnected(async () => {
          try {
            await connection.invoke("JoinChat", conv.id)
          } catch {
            // ignore
          }
        })

        await connection.start()
        await connection.invoke("JoinChat", conv.id)
      } catch (e) {
        const message = e instanceof Error ? e.message : "Не вдалося відкрити чат"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    },
    [accessToken, isAuthenticated, navigate, user?.avatarPublicId, user?.avatarUrl, user?.firstName, user?.id],
  )

  useEffect(() => {
    if (!isOpen) {
      void stopConnection()
    }
  }, [isOpen, stopConnection])

  useEffect(() => {
    return () => {
      void stopConnection()
    }
  }, [stopConnection])

  const overlay = useMemo(() => {
    return (
      <ListingChatOverlay
        isOpen={isOpen}
        isLoading={isLoading}
        error={error}
        conversation={conversation}
        messages={messages}
        currentUserId={user?.id}
        onClose={closeChat}
        onSendMessage={sendMessage}
      />
    )
  }, [closeChat, conversation, error, isLoading, isOpen, messages, sendMessage, user?.id])

  return { openChat, closeChat, overlay, isOpen }
}
