import { useAuth } from "@/auth/AuthContext"
import { Box, Button, Heading, Icon, Stack, Text } from "@chakra-ui/react"
import { FiPlusCircle } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

export function SellBanner() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  return (
    <Box
      rounded="2xl"
      px={{ base: "5", md: "8" }}
      py={{ base: "7", md: "10" }}
      bg="linear-gradient(135deg, #e6fffa 0%, #e0f2fe 100%)"
      borderWidth="1px"
      borderColor="blue.100"
    >
      <Stack gap="4" align={{ base: "start", md: "center" }} textAlign={{ base: "left", md: "center" }}>
        <Heading size={{ base: "lg", md: "xl" }} color="blue.900">
          Готові щось продати?
        </Heading>
        <Text color="blue.700" maxW="2xl">
          Розмістіть оголошення безкоштовно та знайдіть тисячі потенційних покупців у своєму регіоні
        </Text>
        <Button
          colorPalette="blue"
          size="lg"
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
      </Stack>
    </Box>
  )
}
