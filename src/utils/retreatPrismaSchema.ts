import { Category, Lang } from '@prisma/client'

export const categoryToArray = (categories: Record<Category, Category>): Category[] => {
  const catArr: Category[] = []
  for (const categorie in categories) {
    catArr.push(categorie as Category)
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
