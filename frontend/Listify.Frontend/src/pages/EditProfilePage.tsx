import { useAuth } from "@/auth/AuthContext"
// import type { LocationSuggestion } from "@/api/locations"
import { EditProfileFormActions } from "@/components/profile/EditProfileFormActions"
import { EditProfilePageHeading } from "@/components/profile/EditProfilePageHeading"
import { EditProfilePersonalInfoCard } from "@/components/profile/EditProfilePersonalInfoCard"
import { EditProfilePhotoCard } from "@/components/profile/EditProfilePhotoCard"
import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { footerGroups } from "@/data/home-content"
import { useEditProfileForm } from "@/hooks/useEditProfileForm"
import { Box, Button, Container, Heading, Stack, Text } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"



export function EditProfilePage() {
  const navigate = useNavigate()
  const { isAuthenticated, user, refreshCurrentUser } = useAuth()


  // Use custom hook for all logic
  const {
    formData,
    locationInput,
    isSaving,
    saveError,
    suggestions,
    isLoadingLocations,
    shouldShowLocationDropdown,
    shouldShowSelectionHint,
    handleChange,
    handleLocationInputChange,
    handleLocationBlur,
    handleLocationSelect,
    handleSubmit,
    setIsLocationFocused,
    handleAvatarChange,
    handleRemoveAvatar,
    isUploadingAvatar,
    avatarPreview,
  } = useEditProfileForm(user, async () => { await refreshCurrentUser(); }, navigate)

  if (!isAuthenticated) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
        <Header />
        <Box flex="1">
          <Container maxW="4xl" py={{ base: "8", md: "12" }}>
            <Box
              rounded="2xl"
              borderWidth="1px"
              borderColor="blue.100"
              bg="white"
              p={{ base: "5", md: "8" }}
              boxShadow="sm"
            >
              <Stack gap="4" textAlign="center" align="center">
                <Heading size={{ base: "md", md: "lg" }}>Редагування недоступне</Heading>
                <Text color="gray.600">Щоб редагувати профіль, увійдіть у свій акаунт.</Text>
                <Button colorPalette="blue" onClick={() => navigate("/auth")}>
                  Увійти
                </Button>
              </Stack>
            </Box>
          </Container>
        </Box>
        <Footer groups={footerGroups} />
      </Box>
    )
  }


  if (!user) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
        <Header />
        <Box flex="1">
          <Container maxW="4xl" py={{ base: "8", md: "12" }}>
            <Stack align="center" gap="3">
              <Text color="gray.600">Завантажуємо дані профілю...</Text>
            </Stack>
          </Container>
        </Box>
        <Footer groups={footerGroups} />
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      <Header />

      <Box flex="1">
        <Container maxW="4xl" py={{ base: "6", md: "10" }}>
          <Stack gap="6">
            <EditProfilePageHeading onBack={() => navigate("/profile")} />

            <form onSubmit={handleSubmit}>
              <Stack gap="6">
                <EditProfilePhotoCard
                  avatarUrl={user.avatarUrl}
                  avatarPreview={avatarPreview}
                  isUploading={isUploadingAvatar}
                  onFileChange={(files) => handleAvatarChange(files ? files[0] : null)}
                  onRemove={handleRemoveAvatar}
                />

                <EditProfilePersonalInfoCard
                  values={{
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    location: locationInput,
                  }}
                  suggestions={suggestions}
                  isLoadingLocations={isLoadingLocations}
                  shouldShowSelectionHint={shouldShowSelectionHint}
                  shouldShowLocationDropdown={shouldShowLocationDropdown}
                  onFirstNameChange={handleChange("firstName")}
                  onLastNameChange={handleChange("lastName")}
                  onEmailChange={handleChange("email")}
                  onPhoneChange={handleChange("phone")}
                  onLocationInputChange={handleLocationInputChange}
                  onLocationFocus={() => setIsLocationFocused(true)}
                  onLocationBlur={handleLocationBlur}
                  onLocationSelect={handleLocationSelect}
                />

                <EditProfileFormActions
                  isSaving={isSaving}
                  saveError={saveError}
                  onCancel={() => navigate("/profile")}
                />
              </Stack>
            </form>
          </Stack>
        </Container>
      </Box>

      <Footer groups={footerGroups} />
    </Box>
  )
}
