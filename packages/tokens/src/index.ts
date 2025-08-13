export type ColorScheme = 'light' | 'dark'

export interface ThemeTokensInput {
  colorScheme: ColorScheme
}

export const tokens = {
  light: {
    'md-sys-color-primary': 'var(--md-sys-color-primary)',
    'md-sys-color-on-primary': 'var(--md-sys-color-on-primary)',
    'md-sys-color-surface': 'var(--md-sys-color-surface)',
    'md-sys-color-on-surface': 'var(--md-sys-color-on-surface)'
  },
  dark: {
    'md-sys-color-primary': 'var(--md-sys-color-primary)',
    'md-sys-color-on-primary': 'var(--md-sys-color-on-primary)',
    'md-sys-color-surface': 'var(--md-sys-color-surface)',
    'md-sys-color-on-surface': 'var(--md-sys-color-on-surface)'
  }
} as const

export function injectTokensCssVars() {
  if (typeof document === 'undefined') return
  const id = 'sample-tokens-css'
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = '/tokens.css'
  document.head.appendChild(link)
}


