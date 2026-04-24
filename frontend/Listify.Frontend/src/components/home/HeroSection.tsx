import { Box, Heading, HStack, Link, Stack, Text } from "@chakra-ui/react"
import { SearchBar } from "@/components/common/SearchBar"

type HeroSectionProps = {
  popularCategories: string[]
}

export function HeroSection({ popularCategories }: HeroSectionProps) {
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

      <SearchBar />

      <Stack gap="2" direction="row">
        <Text fontWeight="semibold" color="gray.700">
          Популярні категорії:
        </Text>
        <HStack gap="4" wrap="wrap">
          {popularCategories.map((category) => (
            <Link key={category} color="blue.600" fontWeight="medium" href="#">
              {category}
            </Link>
          ))}
        </HStack>
      </Stack>
    </Stack>
  )
}
