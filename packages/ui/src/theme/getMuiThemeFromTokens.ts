import { createTheme } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'

export interface GetMuiThemeFromTokensOptions {
  colorScheme: 'light' | 'dark'
}

export function getMuiThemeFromTokens(options: GetMuiThemeFromTokensOptions): Theme {
  const isDark = options.colorScheme === 'dark'
  const light = {
    primary: '#6750a4',
    onSurface: '#1c1b1f',
    surface: '#fffbfe'
  }
  const dark = {
    primary: '#d0bcff',
    onSurface: '#e6e0e9',
    surface: '#141218'
  }
  const c = isDark ? dark : light
  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: { main: c.primary },
      text: { primary: c.onSurface },
      background: { default: c.surface }
    },
    shape: { borderRadius: 12 }
  })
}


