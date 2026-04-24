export interface ListingData {
  id: number
  title: string
  price: number
  categoryPath: string[]
  location: string
  status: "active" | "waiting" | "inactive"
  views: number
  createdAt: string
  image: string
}

export interface ListingCounts {
  active: number
  waiting: number
  inactive: number
}
