// apps/web/app/layout.tsx
'use client';

import { Inter } from 'next/font/google'
import Providers from '../providers'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import './globals.css'
import { useState } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { Sidebar } from '../components/Sidebar'
import { Box } from '@mui/material'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => setSidebarOpen(v => !v);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <Providers>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header onMenuClick={handleMenuClick} />
             
              <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
              <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
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
