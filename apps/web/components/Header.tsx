'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AppBar, Toolbar, Typography, Button, Box, IconButton, TextField, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { Settings } from '@mui/icons-material'

interface HeaderProps { onMenuClick?: () => void }

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const path = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const go = (href: string, close = false) => () => {
    if (close) setOpen(false)
    router.push(href as any)
  }

  const NAV = [
    { href: '/', label: 'Dashboards' },
    { href: '/inventory-list?delay=1200', label: 'Inventory' },
    { href: '/reports', label: 'Reports' },
  ] as const

  const isActive = (href: string) => (href === '/' ? path === '/' : path.startsWith(href))
  const handleMenuClick = onMenuClick ?? (() => setOpen(v => !v))

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: 'white',paddingTop:'10px', zIndex: (theme) => theme.zIndex.drawer + 1 }} elevation={0}>
        <Toolbar>
          <IconButton edge="start" onClick={handleMenuClick} sx={{ mr: 2, color:'black'}} aria-label="Open menu">
            <Settings />
          </IconButton>

          <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 ,color:'black',justifyContent: 'center',alignItems: 'center' }}>
            Inventory Management System
          </Typography>

              <Box  sx={{position: 'absolute',left: '50%',top: '50%',transform: 'translate(-50%, -50%)',display: { xs: 'none', md: 'flex' },gap: 2,}}>
            {NAV.map(({ href, label }) => (
              <Button
                key={href}
                onClick={go(href)}
                
                sx={{
                   textTransform: 'none', 
                  fontSize:17,
                  color:'black',
                  fontWeight: 500,
                  borderBottom: isActive(href) ? '1px solid #fff' : '2px solid transparent',
                  '&:hover': { color: '#7162BA' },
                }}
              >
                {label}
              </Button>
            ))}
          </Box>
              <TextField
                variant="outlined"
                placeholder="Type here..."
                size="small"
                sx={{ width: 200,background:'#D9D9D9',borderRadius:'13px'}}
                InputProps={{
                  startAdornment: ( 
                <InputAdornment position="start">
                  <IconButton
                    onClick={go('/search')}
                    color="inherit"
                    aria-label="search"
                    edge="start">
                    <SearchIcon sx={{color:'black'}}/>
                  </IconButton>
                </InputAdornment>
        ),
      }}
      />

        </Toolbar>
      </AppBar>
    </>
  )
}
