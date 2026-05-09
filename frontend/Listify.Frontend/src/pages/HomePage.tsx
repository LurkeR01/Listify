import { Box, Container, Stack } from "@chakra-ui/react"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { HeroSection } from "@/components/home/HeroSection"
import { SellBanner } from "@/components/home/SellBanner"
import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { getCategories } from "@/api/categories"
import { useEffect, useState } from "react"
import type { CategoryDto } from "@/DTOs/Category/CategoryDto";
import { footerGroups, popularCategories } from "@/data/home-content"

export function HomePage() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const pupularCategories = categories.filter(category => popularCategories.includes(category.name));

  useEffect(() => {
    void getCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />

      <Container maxW="9xl" py={{ base: "6", md: "10" }}>
        <Stack gap={{ base: "10", md: "14" }}>
          <HeroSection popularCategories={pupularCategories} />
          <CategoryGrid categories={categories} />
          <SellBanner />
        </Stack>
      </Container>

      <Footer groups={footerGroups} />
    </Box>
  )
}
