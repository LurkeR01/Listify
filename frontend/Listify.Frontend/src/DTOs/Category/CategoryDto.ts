export type CategoryDto = {
    id: number
    name: string
    parentId: number | null,
    slug: string | undefined
    iconKey: string 
}