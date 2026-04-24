import { Button, HStack, Input, InputGroup } from "@chakra-ui/react"
import { FiSearch } from "react-icons/fi"

type SearchBarProps = {
  placeholder?: string
  withButton?: boolean
  value?: string
  onChange?: (value: string) => void
  onSubmit?: () => void
}

export function SearchBar({
  placeholder = "Пошук оголошень...",
  withButton = true,
  value,
  onChange,
  onSubmit,
}: SearchBarProps) {
  return (
    <HStack gap="3" w="full" align="stretch">
      <InputGroup startElement={<FiSearch />}>
        <Input
          placeholder={placeholder}
          rounded="2xl"
          size="lg" 
          variant="subtle"
          colorPalette="gray"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSubmit?.()
            }
          }}
        />
      </InputGroup>
      {withButton ? (
        <Button colorPalette="blue" size="lg" px="6" rounded="lg" onClick={onSubmit}>
          Знайти
        </Button>
      ) : null}
    </HStack>
  )
}
