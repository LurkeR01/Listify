import type { ResponseUserDto } from "@/DTOs/User/UserDto"
import { Box, Button, HStack, Icon, Image, Stack, Text } from "@chakra-ui/react"
import type { IconType } from "react-icons"
import { FiList, FiMessageCircle, FiStar, FiUser } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

type ProfileBannerProps = {
  user: ResponseUserDto | null
  onLogout: () => void
  onOpenProfile: () => void
}

type BannerAction = {
  id: string
  title: string
  description: string
  icon: IconType
}

const bannerActions: BannerAction[] = [
  {
    id: "profile",
    title: "Профіль",
    description: "Ваші особисті дані",
    icon: FiUser,
  },
  {
    id: "my-listings",
    title: "Мої оголошення",
    description: "Керувати вашими оголошеннями",
    icon: FiList,
  },
  {
    id: "chats",
    title: "Чати",
    description: "Діалоги з покупцями та продавцями",
    icon: FiMessageCircle,
  },
  {
    id: "ratings",
    title: "Рейтинги",
    description: "Відгуки та оцінки",
    icon: FiStar,
  },
]

const resolveDisplayName = (user: ResponseUserDto | null) => {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim()
  return fullName || user?.username || "Користувач"
}

export function ProfileBanner({ user, onLogout, onOpenProfile }: ProfileBannerProps) {
  const displayName = resolveDisplayName(user)
  const displayEmail = user?.email ?? "email@example.com"
  const navigate = useNavigate()

  const handleActionClick = (actionId: string) => {
    if (actionId === "profile") {
      onOpenProfile()
      return
    }

    if (actionId === "my-listings") {
      navigate("/my-listings")
      return
    }

    if (actionId === "chats") {
      navigate("/chats")
      return
    }

    if (actionId === "ratings") {
      navigate("/profile/ratings")
    }
  }

  return (
    <Box
      position="absolute"
      right="0"
      top="calc(100% + 0.5rem)"
      w={{ base: "72", sm: "80" }}
      maxW="calc(100vw - 2rem)"
      bg="white"
      rounded="xl"
      borderWidth="1px"
      borderColor="blue.100"
      boxShadow="xl"
      overflow="hidden"
      zIndex="popover"
    >
      <Box
        px="4"
        py="4"
        bg="linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
        borderBottomWidth="1px"
        borderColor="blue.100"
      >
        <HStack gap="3" align="start">
          <Box
            w="12"
            h="12"
            rounded="full"
            bg="white"
            borderWidth="1px"
            borderColor="blue.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            overflow="hidden"
          >
            {user?.avatarUrl ? (
              <Image src={user.avatarUrl} alt={displayName} objectFit="cover" width="100%" height="100%" />
            ) : (
              <Icon as={FiUser} boxSize="6" color="blue.600" />
            )}
          </Box>

          <Stack gap="0.5" minW="0">
            <Text fontWeight="semibold" color="blue.900" lineHeight="1.2">
              {displayName}
            </Text>
            <Text
              color="blue.700"
              fontSize="sm"
              lineHeight="1.2"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {displayEmail}
            </Text>
          </Stack>
        </HStack>
      </Box>

      <Stack gap="0" py="1">
        {bannerActions.map((action) => (
          <Button
            key={action.id}
            variant="ghost"
            justifyContent="flex-start"
            rounded="none"
            h="auto"
            px="4"
            py="3"
            _hover={{ bg: "blue.50" }}
            _active={{ bg: "blue.100" }}
            onClick={() => handleActionClick(action.id)}
          >
            <HStack gap="3" align="start" w="full">
              <Icon as={action.icon} boxSize="5" color="blue.600" mt="0.5" flexShrink={0} />
              <Stack gap="0.5" align="start">
                <Text fontWeight="medium" color="gray.800">
                  {action.title}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {action.description}
                </Text>
              </Stack>
            </HStack>
          </Button>
        ))}
      </Stack>

      <Box borderTopWidth="1px" borderColor="blue.100" px="3" py="3">
        <Button
          variant="ghost"
          w="full"
          justifyContent="center"
          color="red.600"
          _hover={{ bg: "red.50", color: "red.700" }}
          _active={{ bg: "red.100" }}
          onClick={onLogout}
        >
          Вийти
        </Button>
      </Box>
    </Box>
  )
}
