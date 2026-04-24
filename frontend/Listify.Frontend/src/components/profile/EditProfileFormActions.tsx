import { Button, HStack, Text } from "@chakra-ui/react"

type EditProfileFormActionsProps = {
  isSaving: boolean
  saveError: string | null
  onCancel: () => void
}

export function EditProfileFormActions({ isSaving, saveError, onCancel }: EditProfileFormActionsProps) {
  return (
    <>
      {saveError ? (
        <Text color="red.600" fontSize="sm">
          {saveError}
        </Text>
      ) : null}

      <HStack gap="3" justify="end" wrap="wrap">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Скасувати
        </Button>
        <Button type="submit" colorPalette="blue" loading={isSaving} loadingText="Зберігаємо...">
          Зберегти зміни
        </Button>
      </HStack>
    </>
  )
}
