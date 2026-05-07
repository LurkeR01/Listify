import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react"
import type { InputProps } from "@chakra-ui/react"
import {
  CheckboxControl,
  CheckboxHiddenInput,
  CheckboxLabel,
  CheckboxRoot,
} from "@chakra-ui/react"
import { useState } from "react"
import type { FormEvent, ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import type { IconType } from "react-icons"
import { FiArrowLeft, FiEye, FiEyeOff, FiLock, FiMail, FiUser } from "react-icons/fi"
import { FaGoogle } from "react-icons/fa"
import axios from "axios"
import { login, register } from "@/api/auth"
import { useAuth } from "@/auth/AuthContext"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { footerGroups } from "@/data/home-content"

const initialForm = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
}

const initialErrors = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  auth: "",
}

type FormState = typeof initialForm

function FormField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <Stack gap="2">
      <Text fontSize="sm" color="gray.700">{label}</Text>
      {children}
      {error ? <Text fontSize="sm" color="red.500">{error}</Text> : null}
    </Stack>
  )
}

type TextInputProps = Omit<InputProps, "onChange" | "value"> & {
  icon: IconType
  value: string
  onChange: (value: string) => void
}

function TextInput({ icon, value, onChange, ...props }: TextInputProps) {
  return (
    <InputGroup startElement={<Icon as={icon} color="gray.400" />}>
      <Input value={value} onChange={(event) => onChange(event.target.value)} {...props} />
    </InputGroup>
  )
}

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState(initialErrors)
  const navigate = useNavigate()
  const { setAccessToken } = useAuth()

  const getFieldError = (
    field: keyof FormState,
    value: string,
    nextForm: FormState,
    showRequired = false
  ) => {
    switch (field) {
      case "email": {
        const normalized = value.trim()
        if (!normalized) return "Некоректний формат email"
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? "" : "Некоректний формат email"
      }
      case "password":
        if (!value) {
          return "Пароль має містити щонайменше 6 символів, 1 літеру та 1 цифру"
        }

        return /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(value)
          ? ""
          : "Пароль має містити щонайменше 6 символів, 1 літеру та 1 цифру"
      case "confirmPassword":
        if (!value) return showRequired ? "Підтвердіть пароль" : ""
        return value === nextForm.password ? "" : "Паролі не співпадають"
      case "firstName":
        return value.trim() ? "" : "Вкажіть ім'я"
      case "lastName":
        return value.trim() ? "" : "Вкажіть прізвище"
      case "phoneNumber":
        if (!value.trim()) return "Вкажіть номер телефону"
        return value.replace(/\D/g, "").length === 9 ? "" : "Номер має містити 9 цифр"
      default:
        return ""
    }
  }

  const handleChange = (field: keyof FormState) => (value: string) => {
    setForm((prev) => {
      const normalizedValue = field === "phoneNumber"
        ? value.replace(/\D/g, "").slice(0, 9)
        : value
      const nextForm = { ...prev, [field]: normalizedValue }

      setErrors((prevErrors) => {
        const nextErrors = {
          ...prevErrors,
          [field]: getFieldError(field, normalizedValue, nextForm),
          auth: "",
        }

        if (!isLogin && field === "password" && nextForm.confirmPassword) {
          nextErrors.confirmPassword = getFieldError("confirmPassword", nextForm.confirmPassword, nextForm)
        }

        return nextErrors
      })

      return nextForm
    })
  }

  const validate = (nextForm = form) => {
    const fields: (keyof FormState)[] = isLogin
      ? ["email", "password"]
      : ["firstName", "lastName", "phoneNumber", "email", "password", "confirmPassword"]

    const newErrors = fields.reduce((acc, field) => {
      acc[field] = getFieldError(field, nextForm[field], nextForm, true)
      return acc
    }, {} as Partial<Record<keyof FormState, string>>)

    setErrors((prev) => ({ ...prev, ...newErrors }))
    return Object.values(newErrors).every((value) => !value)
  }

  const handleAuth = async () => {
    const normalizedEmail = form.email.trim()
    const phoneDigits = form.phoneNumber.replace(/\D/g, "")

    if (!isLogin) {
      await register({
        username: normalizedEmail ? normalizedEmail.split("@")[0] : undefined,
        email: normalizedEmail,
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: phoneDigits ? `+380${phoneDigits}` : "",
      })
    }

    const accessToken = await login(normalizedEmail, form.password)
    setAccessToken(accessToken)
    navigate("/")
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validate()) return

    try {
      await handleAuth()
    } catch (error) {
      console.error("Authentication request failed:", error)
      if (axios.isAxiosError(error)) {
        if (isLogin && error.response?.status === 401) {
          setErrors((prev) => ({ ...prev, auth: "Невірний логин або пароль" }))
          return
        }

        if (!isLogin && error.response?.status === 409) {
          setErrors((prev) => ({ ...prev, auth: "Користувач з таким email вже існує" }))
          return
        }
      }

      setErrors((prev) => ({ ...prev, auth: "Сталася помилка. Спробуйте ще раз." }))
    }
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      <Header />
      <Box flex="1">
        <Container maxW={{ base: "md", md: "lg" }} py={{ base: "6", md: "12" }}>
          <Stack gap={{ base: "4", md: "6" }}>
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            color="gray.600"
            px="0"
            height="auto"
            minW="auto"
            justifyContent="flex-start"
            gap="2"
            _hover={{ color: "gray.900", bg: "transparent" }}
          >
            <Icon as={FiArrowLeft} boxSize="4" />
            Назад на головну
          </Button>

          <Box bg="white" borderWidth="1px" borderColor="blue.100" rounded="2xl" p={{ base: "4", md: "7" }} boxShadow="sm">
            <Stack gap={{ base: "4", md: "6" }}>
              <Stack gap="2" textAlign="center">
                <Heading size={{ base: "xl", md: "2xl" }} color="blue.600" letterSpacing="-0.02em">
                  Listify
                </Heading>
                <Heading size={{ base: "sm", md: "md" }}>
                  {isLogin ? "З поверненням!" : "Створити акаунт"}
                </Heading>
                <Text color="gray.600" fontSize={{ base: "xs", md: "sm" }}>
                  {isLogin
                    ? "Увійдіть у свій акаунт, щоб продовжити"
                    : "Приєднуйтесь до тисяч користувачів, які купують та продають"}
                </Text>
              </Stack>

              <form onSubmit={handleSubmit}>
                <Stack gap={{ base: "3", md: "4" }}>
                  {!isLogin && (
                    <Stack gap="4">
                      <FormField label="Ім'я" error={errors.firstName}>
                        <TextInput
                          icon={FiUser}
                          placeholder="Іван"
                          size={{ base: "md", md: "lg" }}
                          variant="subtle"
                          value={form.firstName}
                          aria-invalid={!!errors.firstName}
                          _invalid={{ borderColor: "red.500", boxShadow: "0 0 0 1px var(--chakra-colors-red-500)" }}
                          onChange={handleChange("firstName")}
                        />
                      </FormField>
                      <FormField label="Прізвище" error={errors.lastName}>
                        <TextInput
                          icon={FiUser}
                          placeholder="Петренко"
                          size={{ base: "md", md: "lg" }}
                          variant="subtle"
                          value={form.lastName}
                          aria-invalid={!!errors.lastName}
                          _invalid={{ borderColor: "red.500", boxShadow: "0 0 0 1px var(--chakra-colors-red-500)" }}
                          onChange={handleChange("lastName")}
                        />
                      </FormField>
                      <FormField label="Номер телефону" error={errors.phoneNumber}>
                        <InputGroup
                          startElement="+380"
                        >
                          <Input
                            size={{ base: "md", md: "lg" }}
                            variant="subtle"
                            type="tel"
                            inputMode="numeric"
                            maxLength={9}
                            value={form.phoneNumber}
                            aria-invalid={!!errors.phoneNumber}
                            _invalid={{ borderColor: "red.500", boxShadow: "0 0 0 1px var(--chakra-colors-red-500)" }}
                            onChange={(event) => handleChange("phoneNumber")(event.target.value)}
                          />
                        </InputGroup>
                      </FormField>
                    </Stack>
                  )}

                  <FormField label="Email" error={errors.email}>
                    <TextInput
                      icon={FiMail}
                      placeholder="you@example.com"
                      size={{ base: "md", md: "lg" }}
                      variant="subtle"
                      type="email"
                      value={form.email}
                      aria-invalid={!!errors.email}
                      _invalid={{ borderColor: "red.500", boxShadow: "0 0 0 1px var(--chakra-colors-red-500)" }}
                      onChange={handleChange("email")}
                    />
                  </FormField>

                  <FormField label="Пароль" error={errors.password}>
                    <InputGroup
                      startElement={<Icon as={FiLock} color="gray.400" />}
                      endElement={
                        <IconButton
                          aria-label={showPassword ? "Сховати пароль" : "Показати пароль"}
                          variant="ghost"
                          size="sm"
                          color="gray.500"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          <Icon as={showPassword ? FiEyeOff : FiEye} />
                        </IconButton>
                      }
                    >
                      <Input
                        placeholder="••••••••"
                        size={{ base: "md", md: "lg" }}
                        variant="subtle"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        aria-invalid={!!errors.password}
                        _invalid={{ borderColor: "red.500", boxShadow: "0 0 0 1px var(--chakra-colors-red-500)" }}
                        onChange={(event) => handleChange("password")(event.target.value)}
                      />
                    </InputGroup>
                  </FormField>

                  {!isLogin && (
                    <FormField label="Підтвердження паролю" error={errors.confirmPassword}>
                      <TextInput
                        icon={FiLock}
                        placeholder="••••••••"
                        size={{ base: "md", md: "lg" }}
                        variant="subtle"
                        type={showPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        aria-invalid={!!errors.confirmPassword}
                        _invalid={{ borderColor: "red.500", boxShadow: "0 0 0 1px var(--chakra-colors-red-500)" }}
                        onChange={handleChange("confirmPassword")}
                      />
                    </FormField>
                  )}

                  {errors.auth ? <Text fontSize="sm" color="red.500">{errors.auth}</Text> : null}

                  {isLogin ? (
                    <Flex justify="space-between" align="center" fontSize="sm">
                      <CheckboxRoot size="sm">
                        <CheckboxHiddenInput />
                        <CheckboxControl />
                        <CheckboxLabel color="gray.700">Запам'ятати мене</CheckboxLabel>
                      </CheckboxRoot>
                      <Link href="#" fontSize="sm" color="blue.600" _hover={{ color: "blue.700" }}>
                        Забули пароль?
                      </Link>
                    </Flex>
                  ) : null}

                  <Button type="submit" size={{ base: "md", md: "lg" }} colorPalette="blue">
                    {isLogin ? "Увійти" : "Зареєструватися"}
                  </Button>
                </Stack>
              </form>

              <Stack gap="3" display={{ base: "none", sm: "flex" }}>
                <HStack>
                  <Box flex="1" borderTopWidth="1px" borderColor="gray.200" />
                  <Text fontSize="sm" color="gray.500">або</Text>
                  <Box flex="1" borderTopWidth="1px" borderColor="gray.200" />
                </HStack>

                <Button variant="outline" size={{ base: "md", md: "lg" }} gap="2">
                  <Icon as={FaGoogle} boxSize="5" />
                  Продовжити з Google
                </Button>
              </Stack>

              <Text textAlign="center" fontSize="sm" color="gray.600">
                {isLogin ? "Немає акаунта? " : "Вже маєте акаунт? "}
                <Link
                  as="button"
                  type="button"
                  fontSize="sm"
                  color="blue.600"
                  fontWeight="semibold"
                  _hover={{ color: "blue.700" }}
                  onClick={() => {
                    setIsLogin((prev) => !prev)
                    setErrors(initialErrors)
                  }}
                >
                  {isLogin ? "Зареєструватися" : "Увійти"}
                </Link>
              </Text>
            </Stack>
          </Box>

          <Text textAlign="center" fontSize="sm" color="gray.500" display={{ base: "none", md: "block" }}>
            Продовжуючи, ви погоджуєтесь з{" "}
            <Link href="#" fontSize="sm" color="blue.600" _hover={{ color: "blue.700" }}>
              Умовами користування
            </Link>{" "}
            та{" "}
            <Link href="#" fontSize="sm" color="blue.600" _hover={{ color: "blue.700" }}>
              Політикою конфіденційності
            </Link>
          </Text>
          </Stack>
        </Container>
      </Box>
      <Footer groups={footerGroups} />
    </Box>
  )
}
