import { Category, Lang } from '@prisma/client'

export const categoryToArray = (categories: Record<Category, Category>): Category[] => {
  const catArr: Category[] = []
  for (const category in categories) {
    catArr.push(category as Category)
  }

  return catArr
}

export const langsToArray = (langs: Record<Lang, Lang>): Lang[] => {
  const langArr: Lang[] = []

  for (const lang in langs) {
    langArr.push(lang as Lang)
  }

  return langArr
}
