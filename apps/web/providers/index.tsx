'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { Provider as ReduxProvider } from 'react-redux'
import { useMemo, useState } from 'react'
import { getMuiThemeFromTokens, injectTokensCssVars } from '@sample/ui'
import { useTheme as useNextTheme } from 'next-themes'
import { store } from '../store'

function ThemeProviders({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useNextTheme()
  injectTokensCssVars()
  const theme = useMemo(() => getMuiThemeFromTokens({ colorScheme: resolvedTheme === 'dark' ? 'dark' : 'light' }), [resolvedTheme])
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient())
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={client}>
        <ThemeProviders>
          <CssBaseline />
          {children}
        </ThemeProviders>
      </QueryClientProvider>
    </ReduxProvider>
  )
}


