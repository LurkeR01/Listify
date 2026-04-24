import api from "./axios"

type UploadSignatureDto = {
  signature: string
  timestamp: number | string
  apiKey: string
  cloudName: string
  folder?: string
  uploadPreset?: string
}

type CloudinaryUploadResponse = {
  secure_url?: string
  url?: string
  public_id?: string
  error?: {
    message?: string
  }
}

export type UploadImageResult = {
  url: string
  publicId: string
}

export const getSignature = async () => {
  const response = await api.get<UploadSignatureDto>("/upload/signature")
  return response.data
}

export const uploadImageToCloudinary = async (file: File): Promise<UploadImageResult> => {
  const signature = await getSignature()

  const formData = new FormData()
  formData.append("file", file)
  formData.append("api_key", signature.apiKey)
  formData.append("timestamp", String(signature.timestamp))
  formData.append("signature", signature.signature)

  if (signature.folder) {
    formData.append("folder", signature.folder)
  }

  if (signature.uploadPreset) {
    formData.append("upload_preset", signature.uploadPreset)
  }

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  )

  const uploadData = (await uploadResponse.json()) as CloudinaryUploadResponse
  const message = uploadData.error?.message ?? "Помилка завантаження фото"
  if (!uploadResponse.ok) {
    throw new Error(message)
  }

  const url = uploadData.secure_url ?? uploadData.url
  const publicId = uploadData.public_id

  if (!url || !publicId) {
    throw new Error("Cloudinary не повернув URL або public_id")
  }

  return { url, publicId }
}
