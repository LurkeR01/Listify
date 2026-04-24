import { Box, HStack, Portal, Select } from "@chakra-ui/react"
import { createListCollection } from "@chakra-ui/react"

type ListingSortingProps = {
  options: string[]
  value: string
  onChange: (value: string) => void
}

export function ListingSorting({ options, value, onChange }: ListingSortingProps) {
  const sortingCollection = createListCollection({
    items: options.map((item) => ({ label: item, value: item })),
  })

  return (
    <HStack w={{ base: "full", md: "auto" }} gap="3" align="center">
      <Box w="240px">
        <Select.Root
          collection={sortingCollection}
          value={[value]}
          size="sm"
          positioning={{ sameWidth: true }}
          onValueChange={(next) => {
            const nextValue = next.value[0]
            if (nextValue) onChange(nextValue)
          }}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Сортування" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {sortingCollection.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </Box>
    </HStack>
  )
}
