export interface Tag {
  text: string
  to: string
}

export interface Card {
  id: number
  image: string
  tags: Tag[]
  text: string
  title: string
  to: string
}
