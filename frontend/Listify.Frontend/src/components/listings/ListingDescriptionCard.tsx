import { Box, Heading, Text } from "@chakra-ui/react"

type ListingDescriptionCardProps = {
  description: string
}

export function ListingDescriptionCard({ description }: ListingDescriptionCardProps) {
  return (
    <Box rounded="2xl" borderWidth="1px" borderColor="blue.100" bg="white" p={{ base: "5", md: "6" }} boxShadow="sm">
      <Heading size="md" mb="3">
        Опис
      </Heading>
      <Text color="gray.700" lineHeight="1.7" whiteSpace="pre-line">
        {description}
      </Text>
    </Box>
  )
}
