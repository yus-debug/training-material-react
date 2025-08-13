import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '../providers'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import './globals.css'

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
          <Providers>{children}</Providers>
        </NextThemeProvider>
      </body>
    </html>
  )
}


