import { useEffect, useState } from "react"
import { searchLocations, type LocationSuggestion } from "@/api/locations"

type UseLocationSuggestionsResult = {
  suggestions: LocationSuggestion[]
  isLoading: boolean
}

export function useLocationSuggestions(query: string): UseLocationSuggestionsResult {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const trimmedQuery = query.trim()

    if (trimmedQuery.length < 2) {
      setSuggestions([])
      setIsLoading(false)
      return
    }

    let isCancelled = false
    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true)
        const data = await searchLocations(trimmedQuery)

        if (!isCancelled) {
          setSuggestions(data)
        }
      } catch (error) {
        console.error(error)

        if (!isCancelled) {
          setSuggestions([])
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }, 500)

    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
    }
  }, [query])

  return { suggestions, isLoading }
}
