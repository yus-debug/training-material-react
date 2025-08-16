// apps/web/components/Header.tsx
'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import { MdOutlineManageAccounts } from 'react-icons/md'

interface HeaderProps { onMenuClick?: () => void }

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const path = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const go = (href: string, close = false) => () => {
    if (close) setOpen(false)
    router.push(href as any) // typed-routes quick fix
  }

  const NAV = [
    { href: '/', label: 'Home' },
    { href: '/inventory', label: 'Inventory' },
    { href: '/reports', label: 'Reports' },
  ] as const

  const isActive = (href: string) => (href === '/' ? path === '/' : path.startsWith(href))
  const handleMenuClick = onMenuClick ?? (() => setOpen(v => !v))

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleMenuClick} sx={{ mr: 2 }} aria-label="Open menu">
            <MenuIcon />
          </IconButton>

          <MdOutlineManageAccounts size={30} />
          <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
            Inventory Management System
          </Typography>

          <IconButton onClick={go('/search')} color="inherit" aria-label="search" sx={{ mr: 0.5 }}>
            <SearchIcon />
          </IconButton>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
            {NAV.map(({ href, label }) => (
              <Button
                key={href}
                onClick={go(href)}
                color="inherit"
                sx={{
                  borderBottom: isActive(href) ? '2px solid #fff' : '2px solid transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
                }}
              >
                {label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
    </>
  )
}
