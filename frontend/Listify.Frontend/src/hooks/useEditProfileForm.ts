import { useState, useRef, useEffect } from "react"
import { updateUserProfile } from "@/api/user"
import type { LocationSuggestion } from "@/api/locations"
import type { CityDto } from "@/DTOs/Location/CityDto"
import { useLocationSuggestions } from "@/hooks/useLocationSuggestions"
import { uploadImageToCloudinary } from "@/api/upload"

export type EditProfileForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
}

const toLocationSuggestion = (location: CityDto | null | undefined): LocationSuggestion | null => {
  if (!location) return null
  const name = location.name?.trim() ?? ""
  const ref = location.ref?.trim() ?? ""
  const area = location.area?.trim() ?? ""
  const label = area ? `${name}, ${area}` : name
  if (!name || !ref) return null
  return {
    name,
    area,
    ref,
    label,
    value: label,
  }
}

function validateEmail(email: string) {
  // Basic email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone: string) {
  // Basic phone: digits, +, -, spaces, min 7 chars
  return /^[\d\s\-+()]{7,}$/.test(phone)
}

function getSaveErrorMessage(error: unknown) {
  // Try to extract error from axios/fetch
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as any).response === "object" &&
    (error as any).response !== null
  ) {
    const response = (error as any).response as Record<string, unknown>
    if ("data" in response) {
      const data = response.data as any
      if (typeof data === "string") return data
      if (data && typeof data.message === "string") return data.message
    }
    if (typeof response.status === "number") {
      if (response.status === 400) return "Некорректні дані. Перевірте форму."
      if (response.status === 500) return "Серверна помилка. Спробуйте пізніше."
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return "Не вдалося оновити профіль. Спробуйте ще раз."
}

export function useEditProfileForm(user: any, refreshCurrentUser: () => Promise<void>, navigate: (url: string) => void) {
  const [formData, setFormData] = useState<EditProfileForm>({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: user?.phoneNumber ?? "",
  })
  const [locationInput, setLocationInput] = useState<string>(user?.location ? toLocationSuggestion(user.location)?.label ?? "" : "")
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null)
  const [isLocationFocused, setIsLocationFocused] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const avatarFileRef = useRef<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatarUrl ?? undefined)
  const prevObjectUrlRef = useRef<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const initialLocation = toLocationSuggestion(user?.location)
  const resolvedLocationInput = locationInput
  const resolvedLocation = selectedLocation === null ? initialLocation : selectedLocation
  const { suggestions, isLoading: isLoadingLocations } = useLocationSuggestions(resolvedLocationInput)
  const shouldShowLocationDropdown = isLocationFocused && resolvedLocationInput.trim().length >= 2
  const shouldShowSelectionHint = resolvedLocationInput.trim().length > 0 && !resolvedLocation

  function handleChange(field: keyof EditProfileForm) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }))
      setSaveError(null)
    }
  }

  function handleAvatarChange(file: File | null) {
    if (!file) return
    // store file in a ref and show preview via object URL
    avatarFileRef.current = file
    // revoke previous object URL if we created one
    if (prevObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(prevObjectUrlRef.current)
      } catch {}
      prevObjectUrlRef.current = null
    }
    const obj = URL.createObjectURL(file)
    prevObjectUrlRef.current = obj
    setAvatarPreview(obj)
    setSaveError(null)
  }

  function handleRemoveAvatar() {
    avatarFileRef.current = null
    // revoke object url if any
    if (prevObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(prevObjectUrlRef.current)
      } catch {}
      prevObjectUrlRef.current = null
    }
    setAvatarPreview(undefined)
    setSaveError(null)
  }

  useEffect(() => {
    return () => {
      if (prevObjectUrlRef.current) {
        try {
          URL.revokeObjectURL(prevObjectUrlRef.current)
        } catch {}
      }
    }
  }, [])

  function handleLocationInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setLocationInput(event.target.value)
    setSelectedLocation(null)
    setSaveError(null)
  }

  function handleLocationBlur() {
    setTimeout(() => {
      setIsLocationFocused(false)
    }, 0) // 0ms, so mousedown on dropdown fires first
  }

  function handleLocationSelect(location: LocationSuggestion) {
    setLocationInput(location.label)
    setSelectedLocation(location)
    setIsLocationFocused(false)
    setSaveError(null)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const { firstName, lastName, email, phone } = formData
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setSaveError("Заповніть усі обов'язкові поля.")
      return
    }
    if (!validateEmail(email)) {
      setSaveError("Введіть коректний email.")
      return
    }
    if (!validatePhone(phone)) {
      setSaveError("Введіть коректний телефон.")
      return
    }
    if (resolvedLocationInput.trim().length > 0 && !resolvedLocation) {
      setSaveError("Оберіть локацію зі списку підказок.")
      return
    }
    setIsSaving(true)
    setSaveError(null)
    try {
      // If user selected a new avatar file, upload it first
      let avatarUrl: string | null = null
      let avatarPublicId: string | null = null
      const file = avatarFileRef.current as unknown as File | null
      if (file) {
        setIsUploadingAvatar(true)
        try {
          const uploaded = await uploadImageToCloudinary(file)
          avatarUrl = uploaded.url
          avatarPublicId = uploaded.publicId
        } finally {
          setIsUploadingAvatar(false)
        }
      }
      await updateUserProfile({
        FirstName: firstName.trim(),
        LastName: lastName.trim(),
        Email: email.trim(),
        PhoneNumber: phone.trim(),
        Location: resolvedLocation
          ? {
              Name: resolvedLocation.name,
              Ref: resolvedLocation.ref,
              Area: resolvedLocation.area,
            }
          : null,
        AvatarUrl: avatarUrl ?? undefined,
        AvatarPublicId: avatarPublicId ?? undefined,
      })
      await refreshCurrentUser()
      navigate("/profile")
    } catch (error) {
      setSaveError(getSaveErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return {
    formData,
    setFormData,
    locationInput,
    setLocationInput,
    selectedLocation,
    setSelectedLocation,
    isLocationFocused,
    setIsLocationFocused,
    isSaving,
    saveError,
    avatarPreview,
    suggestions,
    isLoadingLocations,
    shouldShowLocationDropdown,
    shouldShowSelectionHint,
    handleChange,
    handleLocationInputChange,
    handleLocationBlur,
    handleLocationSelect,
    handleSubmit,
    // avatar helpers
    handleAvatarChange,
    handleRemoveAvatar,
    isUploadingAvatar,
    avatarFileRef,
  }
}
