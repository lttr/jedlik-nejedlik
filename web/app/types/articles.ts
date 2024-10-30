export interface Tag {
  text: string
  to: string
}

export interface Card {
  id: number
  image: string
  to: string
  tags: Tag[]
  title: string
  text: string
  headingLevel: "h1" | "h2" | "h3"
}
