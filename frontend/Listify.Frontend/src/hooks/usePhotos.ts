import { useEffect, useRef, useState } from "react"
import type { DragEvent } from "react"

export type PhotoItem = {
  id: string
  file: File
  url: string
  rotation: number
}

type UsePhotosProps = {
  maxPhotos: number
  initialPhotos?: Array<Pick<PhotoItem, "id" | "url"> & Partial<Pick<PhotoItem, "rotation" | "file">>>
}

function createPhotoId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const isObjectUrl = (url: string) => url.startsWith("blob:")

const fileNameFromUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    const last = parsed.pathname.split("/").filter(Boolean).pop()
    return last || "existing-image"
  } catch {
    const last = url.split("/").filter(Boolean).pop()
    return last || "existing-image"
  }
}

export function usePhotos({ maxPhotos, initialPhotos }: UsePhotosProps) {
  const [photos, setPhotos] = useState<PhotoItem[]>(() => {
    if (!initialPhotos || initialPhotos.length === 0) {
      return []
    }

    return initialPhotos.slice(0, maxPhotos).map((item) => ({
      id: item.id,
      url: item.url,
      rotation: item.rotation ?? 0,
      file: item.file ?? new File([], fileNameFromUrl(item.url), { type: "image/*" }),
    }))
  })
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const previousPhotosRef = useRef<PhotoItem[]>([])

  useEffect(() => {
    const previous = previousPhotosRef.current
    const removed = previous.filter((item) => !photos.some((photo) => photo.id === item.id))
    removed.forEach((item) => {
      if (isObjectUrl(item.url)) {
        URL.revokeObjectURL(item.url)
      }
    })
    previousPhotosRef.current = photos
  }, [photos])

  useEffect(() => {
    return () => {
      previousPhotosRef.current.forEach((item) => {
        if (isObjectUrl(item.url)) {
          URL.revokeObjectURL(item.url)
        }
      })
    }
  }, [])

  const remainingSlots = maxPhotos - photos.length

  // Note: initialPhotos are only applied on first render of the hook instance.
  // If you need to re-initialize (e.g. when listing id changes), remount the component (use `key`).

  const addPhotos = (files: FileList | null) => {
    if (!files) return
    const incoming = Array.from(files)
    const allowed = incoming.slice(0, Math.max(0, remainingSlots))
    if (allowed.length === 0) return

    const nextItems = allowed.map((file) => ({
      id: createPhotoId(),
      file,
      url: URL.createObjectURL(file),
      rotation: 0,
    }))
    setPhotos((prev) => [...prev, ...nextItems])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((item) => item.id !== id))
  }

  const rotatePhoto = (id: string) => {
    setPhotos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, rotation: (item.rotation + 90) % 360 } : item
      )
    )
  }

  const handleDragStart = (event: DragEvent<HTMLDivElement>, index: number) => {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", String(index))
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetIndex: number) => {
    event.preventDefault()
    const sourceIndex = Number(event.dataTransfer.getData("text/plain"))
    if (Number.isNaN(sourceIndex) || sourceIndex === targetIndex) return
    setPhotos((prev) => {
      const next = prev.slice()
      const [moved] = next.splice(sourceIndex, 1)
      next.splice(targetIndex, 0, moved)
      return next
    })
  }

  return {
    photos,
    fileInputRef,
    remainingSlots,
    addPhotos,
    removePhoto,
    rotatePhoto,
    handleDragStart,
    handleDrop,
  }
}
