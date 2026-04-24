import { Box, Container, Grid, Heading, Link, Stack } from "@chakra-ui/react"
import type { FooterGroup } from "@/data/home-content"

type FooterProps = {
  groups: FooterGroup[]
}

export function Footer({ groups }: FooterProps) {
  return (
    <Box as="footer" mt="16" borderTopWidth="1px" borderColor="blue.100" bg="white">
      <Container maxW="9xl" py="10">
        <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap="8">
          {groups.map((group) => (
            <Stack key={group.title} gap="3">
              <Heading size="sm" color="gray.800">
                {group.title}
              </Heading>
              {group.links.map((link) => (
                <Link key={link} href="#" color="gray.600" _hover={{ color: "blue.600" }}>
                  {link}
                </Link>
              ))}
            </Stack>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
