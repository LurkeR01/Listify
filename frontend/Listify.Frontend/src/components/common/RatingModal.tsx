import { useState } from "react"
import { 
  Box, Button, Field, HStack, Icon, Stack, Textarea, 
  DialogRoot, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogActionTrigger 
} from "@chakra-ui/react"
import { LuStar } from "react-icons/lu"

type RatingModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { rating: number; comment: string }) => void
}

export function RatingModal({ isOpen, onClose, onSubmit }: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState("")

  return (
    <DialogRoot open={isOpen} onOpenChange={onClose} placement="center">
      <DialogContent rounded="2xl" p="4">
        <DialogHeader>Оцініть досвід співпраці</DialogHeader>
        <DialogBody>
          <Stack gap="6">
            <Stack align="center" gap="2">
              <HStack gap="2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    as={LuStar}
                    boxSize="8"
                    cursor="pointer"
                    fill={(hover || rating) >= star ? "#EAB308" : "none"}
                    color={(hover || rating) >= star ? "#EAB308" : "gray.300"}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                    transition="transform 0.1s"
                    _hover={{ transform: "scale(1.1)" }}
                  />
                ))}
              </HStack>
              <Box fontSize="sm" color="gray.500">
                {rating > 0 ? `Ваша оцінка: ${rating} з 5` : "Оберіть кількість зірок"}
              </Box>
            </Stack>

            <Field.Root>
              <Field.Label>Ваш коментар (необов'язково)</Field.Label>
              <Textarea
                placeholder="Розкажіть детальніше про покупку..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rounded="xl"
                rows={3}
              />
            </Field.Root>
          </Stack>
        </DialogBody>
        <DialogFooter gap="3">
          <DialogActionTrigger asChild>
            <Button variant="ghost" rounded="xl">Скасувати</Button>
          </DialogActionTrigger>
          <Button 
            colorPalette="blue" 
            rounded="xl" 
            disabled={rating === 0}
            onClick={() => onSubmit({ rating, comment })}
          >
            Залишити відгук
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}