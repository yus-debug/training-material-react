import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '../providers'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import './globals.css'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { Box } from '@mui/material'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sample Inventory',
  description: 'Inventory learning monorepo with MUI MD3 and tokens',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <Providers>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header/>
            <Box component="main" sx={{ flexGrow: 1 }}>
            {children}
            </Box>
            <Footer logoSrc="/logo.png" />
            </Box>
          </Providers>
        </NextThemeProvider>
      </body>
    </html>
  )
}


