import { Box, Heading, Icon, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import type { CategoryDto } from "@/DTOs/Category/CategoryDto";
import { iconMap, defaultIcon } from "@/data/home-content";

type Props = {
  categories: CategoryDto[]
}

export function CategoryGrid({ categories }: Props) {
  const navigate = useNavigate()

  return (
    <Stack gap="6">
      <Heading size="lg" color="gray.900" letterSpacing="-0.02em">
        Категорії
      </Heading>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="5">
        {categories.filter((category) => category.parentId === null).map((category) => {
          const IconCmp = iconMap[category.iconKey] ?? defaultIcon

          return (
            <Box
              key={category.id}
              rounded="2xl"
              borderWidth="1px"
              borderColor="blue.100"
              bg="linear-gradient(180deg, white 0%, blue.50 100%)"
              px="4"
              py="3"
              minH="72px"
              boxShadow="sm"
              transition="all 0.25s ease"
              _hover={{ borderColor: "blue.300", transform: "translateY(-4px)", boxShadow: "lg" }}
              display="flex"
              alignItems="center"
              cursor="pointer"
              onClick={() => navigate(`/listings/${category.id}`)}
              role="link"
              tabIndex={0}
            >
              <Box
                w="9"
                h="9"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="blue.100"
                color="blue.600"
                flexShrink={0}
              >
                <Icon as={IconCmp} boxSize="4.5" />
              </Box>
              <Text ml="3" fontWeight="semibold" color="gray.900" fontSize="md" lineClamp="1">
                {category.name}
              </Text>
            </Box>
          )})}
      </SimpleGrid>
    </Stack>
  )
}
