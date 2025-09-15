// apps/web/app/layout.tsx
'use client';

import { Inter } from 'next/font/google';
import Providers from '../providers';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import './globals.css';
import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Sidebar } from '../components/Sidebar';
import { Box } from '@mui/material';
import { CartProvider } from '../contexts/CartContext';
import { AuthProvider } from '../contexts/AuthContext';
import '../lib/fetchAuthPatch';
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleMenuClick = () => setSidebarOpen(v => !v);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {mounted ? (
          <NextThemeProvider attribute="data-theme" defaultTheme="light" enableSystem>
            <Providers>
              <CartProvider>
                <AuthProvider>
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                  <Header onMenuClick={handleMenuClick} />
                  <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                  <Box 
                    component="main" 
                    sx={{ flexGrow: 1, p: 3, pt: '94px',transition: 'margin-left 0.3s ease', marginLeft: sidebarOpen ? { xs: 0, md: '320px' } : 0 }}>
                    {children}
                  </Box>
                  <Footer logoSrc="/logo.png" />
                </Box>
                </AuthProvider>
              </CartProvider>
            </Providers>
          </NextThemeProvider>
        ) : null}
      </body>
    </html>
  );
}
