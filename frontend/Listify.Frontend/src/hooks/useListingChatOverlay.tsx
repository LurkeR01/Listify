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

  const getHubUrl = (): string => {
    const base = String(api.defaults.baseURL ?? "").trim()
    if (!base) return "/chat"
    return base.replace(/\/api\/?$/i, "") + "/chat"
  }

  export function useListingChatOverlay(): UseListingChatOverlayResult {
    const { accessToken, isAuthenticated, user } = useAuth()
    const navigate = useNavigate()

    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversation, setConversation] = useState<ConversationDto | null>(null)

  const connectionRef = useRef<HubConnection | null>(null)
  const objectUrlsRef = useRef<string[]>([])

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
    void stopConnection()

    for (const url of objectUrlsRef.current) {
      try {
        URL.revokeObjectURL(url)
      } catch {
        // ignore
      }
    }
    objectUrlsRef.current = []
  }, [stopConnection])

  const sendMessage = useCallback(
    (payload: { text: string; image?: File | null }) => {
      const text = payload.text ?? ""
      const file = payload.image ?? null

      if (!text.trim() && !file) return

      const nowIso = new Date().toISOString()
      const tempId = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now())

      let imageUrl: string | undefined
      let imageName: string | undefined

      if (file) {
        try {
          imageUrl = URL.createObjectURL(file)
          objectUrlsRef.current.push(imageUrl)
          imageName = file.name
        } catch {
          imageUrl = undefined
          imageName = undefined
        }
      }

      const message: MessageDto = {
        id: tempId,
        text: text.trim() || (file ? "" : ""),
        sender: {
          id: user?.id ?? "",
          firstName: user?.firstName ?? "",
          avatarUrl: user?.avatarUrl ?? undefined,
          avatarPublicId: user?.avatarPublicId ?? undefined,
        },
        createdAt: nowIso,
        imageUrl,
        imageName,
      }

      setConversation((prev) => {
        if (!prev) return prev
        return { ...prev, lastMessages: [...prev.lastMessages, message] }
      })
    },
    [user?.avatarPublicId, user?.avatarUrl, user?.firstName, user?.id],
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

          const hubUrl = getHubUrl()
          const connection = new HubConnectionBuilder()
            .withUrl(hubUrl, {
              accessTokenFactory: () => accessToken,
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build()

          connectionRef.current = connection

          await connection.start()
          await connection.invoke("JoinChat", conv.id)
        } catch (e) {
          const message = e instanceof Error ? e.message : "Не вдалося відкрити чат"
          setError(message)
        } finally {
          setIsLoading(false)
        }
      },
      [accessToken, isAuthenticated, navigate],
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
        currentUserId={user?.id}
        onClose={closeChat}
        onSendMessage={sendMessage}
      />
    )
  }, [closeChat, conversation, error, isLoading, isOpen, sendMessage, user?.id])

  return { openChat, closeChat, overlay, isOpen }
}
