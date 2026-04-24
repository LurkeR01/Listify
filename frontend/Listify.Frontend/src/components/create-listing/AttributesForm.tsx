import { Box, Portal, Select, Stack, Text } from "@chakra-ui/react"
import { createListCollection } from "@chakra-ui/react"
import type { CategoryAttributeDto } from "@/DTOs/Category/CategoryAttributeDto"
import type { CategoryDto } from "@/DTOs/Category/CategoryDto"

type AttributesFormProps = {
  selectedCategory: CategoryDto | null
  attributes: CategoryAttributeDto[]
  attributeSelections: Record<number, string | undefined>
  onChange: (attributeId: number, nextValue: string) => void
}

export function AttributesForm({
  selectedCategory,
  attributes,
  attributeSelections,
  onChange,
}: AttributesFormProps) {
  if (!selectedCategory) {
    return (
      <Box rounded="lg" bg="blue.50" borderWidth="1px" borderColor="blue.100" p="3">
        <Text fontSize="sm" color="blue.700">
          Оберіть категорію, щоб додати характеристики товару.
        </Text>
      </Box>
    )
  }

  if (attributes.length === 0) {
    return (
      <Text fontSize="sm" color="gray.500">
        Для цієї категорії немає додаткових характеристик.
      </Text>
    )
  }

  return (
    <Stack gap="3">
      {attributes.map((attr) => {
        const collection = createListCollection({
          items: [
            ...attr.values.map((val) => ({
              label: val.value,
              value: String(val.id),
            })),
            { label: "Інше", value: "other" },
          ],
        })
        const selectedValue = attributeSelections[attr.id]
        const selectValue = selectedValue ? [selectedValue] : undefined

        return (
          <Stack key={attr.id} gap="2">
            <Text fontWeight="medium" color="gray.700">
              {attr.name}
            </Text>
            <Select.Root
              collection={collection}
              value={selectValue}
              size="sm"
              positioning={{ sameWidth: true }}
              onValueChange={(value) => onChange(attr.id, value.value[0] ?? "")}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Оберіть значення" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {collection.items.map((item) => (
                      <Select.Item key={item.value} item={item}>
                        <Select.ItemText>{item.label}</Select.ItemText>
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Stack>
        )
      })}
    </Stack>
  )
}
