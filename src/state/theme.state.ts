import { proxy, useSnapshot } from 'valtio'

type ThemeState = {
  darkMode: boolean
}

const themeState = proxy<ThemeState>({
  darkMode: false,
})

const toggleDarkMode = () => {
  themeState.darkMode = !themeState.darkMode
}

const setDarkMode = (value: boolean) => {
  themeState.darkMode = value
}

export const useThemeState = () => ({
  toggleDarkMode,
  setDarkMode,
  themeSnapshot: useSnapshot(themeState),
})