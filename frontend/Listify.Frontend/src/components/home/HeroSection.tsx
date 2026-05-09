import { Box, Heading, HStack, Link, Stack, Text } from "@chakra-ui/react"
import { SearchBar } from "@/components/common/SearchBar"
import { useNavigate } from "react-router-dom"
import type { CategoryDto } from "@/DTOs/Category/CategoryDto";
import { useSearchParams } from "react-router-dom"
import { useState } from "react"

type HeroSectionProps = {
  popularCategories: CategoryDto[]
}

export function HeroSection({ popularCategories }: HeroSectionProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams()
  const [searchText, setSearchText] = useState(() => searchParams.get("search") ?? "")

  const handleSearch = () => {
    const trimmed = searchText.trim()
    if (!trimmed) {
      if (location.pathname.startsWith("/listings") && searchParams.has("search")) {
        navigate({ pathname: location.pathname, search: "" }, { replace: true })
      }
      return
    }

    navigate(
        `/listings?search=${encodeURIComponent(trimmed)}`
    )
  }
  return (
    <Stack gap="6">
      <Box
        rounded="2xl"
        px={{ base: "5", md: "8" }}
        py={{ base: "7", md: "10" }}
        bg="linear-gradient(135deg, #ebf8ff 0%, #dbeafe 100%)"
      >
        <Heading size={{ base: "xl", md: "2xl" }} color="blue.800">
          Купуйте та продавайте будь-що, будь-де
        </Heading>
        <Text mt="3" color="blue.700" fontSize={{ base: "md", md: "lg" }}>
          Приєднуйтеся до мільйонів користувачів, які знаходять вигідні пропозиції у своєму регіоні
        </Text>
      </Box>

      <SearchBar
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

      <Stack gap="2" direction="row">
        <Text fontWeight="semibold" color="gray.700">
          Популярні категорії:
        </Text>
        <HStack gap="4" wrap="wrap">
          {popularCategories.map((category) => (
            <Link 
            onClick={() => navigate(`/listings/${category.id}`)}
            key={category.id} color="blue.600" fontWeight="medium" href="#">
              {category.name}
            </Link>
          ))}
        </HStack>
      </Stack>
    </Stack>
  )
}
