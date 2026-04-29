import { Avatar, Box, Button, Container, Flex, Heading, HStack, Icon, IconButton } from "@chakra-ui/react"
import { FiPlusCircle, FiUser } from "react-icons/fi"
import { SearchBar } from "@/components/common/SearchBar"
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/auth/AuthContext"
import { ProfileBanner } from "./ProfileBanner"

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { id } = useParams()
  const categoryId = id ? parseInt(id) : undefined
  const [searchText, setSearchText] = useState(() => searchParams.get("search") ?? "")
  const [isProfileBannerOpen, setIsProfileBannerOpen] = useState(false)
  const profileButtonGroupRef = useRef<HTMLDivElement | null>(null)
  const { isAuthenticated, user, setAccessToken } = useAuth()
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || user?.username || "Користувач"

  useEffect(() => {
    if (!isProfileBannerOpen) return

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (!profileButtonGroupRef.current?.contains(target)) {
        setIsProfileBannerOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileBannerOpen(false)
      }
    }

    document.addEventListener("mousedown", handleDocumentClick)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isProfileBannerOpen])

  const handleSearch = () => {
    const trimmed = searchText.trim()
    if (!trimmed) {
      if (location.pathname.startsWith("/listings") && searchParams.has("search")) {
        navigate({ pathname: location.pathname, search: "" }, { replace: true })
      }
      return
    }

    navigate(
      categoryId
        ? `/listings/${categoryId}?search=${encodeURIComponent(trimmed)}`
        : `/listings?search=${encodeURIComponent(trimmed)}`
    )
  }

  return (
    <Flex as="header" borderBottomWidth="1px" borderColor="blue.100" bg="white" position="sticky" top="0" zIndex="10">
      <Container maxW="9xl" py="3">
        <Flex gap="4" align="center" justify="space-between">
          <Button 
            variant="ghost"
            rounded="lg" 
            _hover={{ bg: "none", color: "inherit" }}
            onClick={() => navigate("/")}>
            <Heading size="2xl" color="blue.600" letterSpacing="-0.02em">
              Listify
            </Heading>
          </Button>

          <Flex display={{ base: "none", md: "flex" }} flex="1" maxW="2xl" mx="4">
            <SearchBar
              withButton={false}
              value={searchText}
              onChange={(value) => {
                setSearchText(value)
                if (
                  !value.trim() &&
                  location.pathname.startsWith("/listings") &&
                  searchParams.has("search")
                ) {
                  navigate({ pathname: location.pathname, search: "" }, { replace: true })
                }
              }}
              onSubmit={handleSearch}
            />
          </Flex>

          <HStack gap="5">        
            <Button 
            colorPalette="blue"
             rounded="lg"
             onClick={() => {
              if (!isAuthenticated) {
                navigate("/auth")
                return
              }
              navigate("/create")
             }}>
              <Icon as={FiPlusCircle} />
              Створити оголошення
            </Button>
            <Box position="relative" ref={profileButtonGroupRef}>
              <IconButton 
                aria-label="Профіль" 
                aria-expanded={isProfileBannerOpen}
                colorPalette="blue"
                variant="outline"
                rounded="full"
                p="0"
                overflow="hidden"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/auth")
                    return
                  }

                  setIsProfileBannerOpen((prev) => !prev)
                }}>
                {isAuthenticated && user?.avatarUrl ? (
                  <Avatar.Root size="sm" bg="transparent">
                    <Avatar.Image src={user.avatarUrl} alt={displayName} />
                    <Avatar.Fallback name={displayName} />
                  </Avatar.Root>
                ) : (
                  <FiUser />
                )}
              </IconButton>

              {isAuthenticated && isProfileBannerOpen ? (
                <ProfileBanner
                  user={user}
                  onOpenProfile={() => {
                    setIsProfileBannerOpen(false)
                    navigate("/profile")
                  }}
                  onLogout={() => {
                    setAccessToken(null)
                    setIsProfileBannerOpen(false)
                  }}
                />
              ) : null}
            </Box>
          </HStack>
        </Flex>
      </Container>
    </Flex>
  )
}
