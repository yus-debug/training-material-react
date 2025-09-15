'use client';

import * as React from 'react';
import {Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Divider, Collapse,TextField, InputAdornment, useMediaQuery, useTheme, Avatar, Tooltip, IconButton, Typography, Button} from '@mui/material';
import {Dashboard, Inventory, People, ShoppingCart, Assessment, ExpandLess, ExpandMore,Inventory2, Category, Search as SearchIcon, Logout} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { styled } from '@mui/material/styles';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import { useAuth } from '../contexts/AuthContext';
import { IoHome } from "react-icons/io5";
import { color } from '@mui/system';
import { AiOutlineBulb } from "react-icons/ai";
import { IoPerson } from "react-icons/io5";
import { PiShoppingCartSimpleFill } from "react-icons/pi";

const drawerWidth = 300;

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

// DrawerHeader
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const pathname = usePathname() || '';

  //Auth
  const { user: authUser, logout, loginGoogle } = useAuth();

  //dynamic height
  const [sidebarHeight, setSidebarHeight] = React.useState('calc(100vh - 80px)');
  const [sidebarTopMargin, setSidebarTopMargin] = React.useState('80px');
  const [scrollY, setScrollY] = React.useState(0);
  
  React.useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const footerHeight = 80;
          const headerHeight = 80;
          
          //position state
          setScrollY(currentScrollY);
          
          //distance bottom
          const distanceFromBottom = documentHeight - (currentScrollY + windowHeight);
          
          // Dynamic top margin
          const dynamicTopMargin = Math.max(10, headerHeight - currentScrollY);
          setSidebarTopMargin(`${dynamicTopMargin}px`);
          
          // Dynamic height 
          const baseHeight = windowHeight - dynamicTopMargin;
          
          if (distanceFromBottom <= footerHeight) {
            //shrink sidebar
            const shrinkAmount = Math.max(0, footerHeight - distanceFromBottom);
            setSidebarHeight(`${baseHeight - shrinkAmount}px`);
          } else {
            // Normal height
            setSidebarHeight(`${baseHeight}px`);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const displayName = authUser?.displayName || 'Signed in';
  const subline = authUser?.email || 'User';
  const initials = (authUser?.displayName || authUser?.email || 'U?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  //Search
  const [q, setQ] = React.useState('');
  const query = q.trim().toLowerCase();
  const match = (label: string) => label.toLowerCase().includes(query);

  //Collapsible
  const [invOpen, setInvOpen] = React.useState(() => pathname.startsWith('/inventory'));

  const nav = (path: string) => {
    router.push(path as any);
    if (isMobile) onClose();
  };
  const active = (path: string) => {
    if (pathname === '/' || pathname === '/dashboard') {
      return path === '/dashboard' || path === '/';
    }
    return path === '/' ? pathname === '/' : pathname.startsWith(path);
  };

  const inventoryChildren = [
    { text: 'Products', path: '/products', icon: <AiOutlineBulb /> },
    { text: 'Categories', path: '/categories', icon: <Category /> },
  ];

  const filteredInvChildren = query ? inventoryChildren.filter(c => match(c.text)) : inventoryChildren;

  const showDashboard = !query || match('Dashboard');
  const showInventory = !query || match('Inventory') || filteredInvChildren.length > 0;

  const menuItems = [
    { text: 'Customers', path: '/customers', icon: <IoPerson /> },
    { text: 'Orders', path: '/orders', icon: <PiShoppingCartSimpleFill />
 },
    { text: 'Reports', path: '/reports', icon: <Assessment /> },
  ] as const;

  const filteredMenuItems = menuItems.filter(
    (item) => !query || item.text.toLowerCase().includes(query)
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const listRef = React.useRef<HTMLUListElement | null>(null);
  const onListKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const t = e.target as HTMLElement;
    if (t.tagName === 'INPUT' || t.closest('input')) return;
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

    const root = listRef.current;
    if (!root) return;

    const buttons = Array.from(root.querySelectorAll<HTMLElement>('[data-nav="btn"]'));
    if (buttons.length === 0) return;

    const cur = document.activeElement as HTMLElement | null;
    const idx = buttons.findIndex(el => el === cur || (cur && el.contains(cur)));

    if (idx === -1) {
      buttons[0]?.focus();
      e.preventDefault();
      return;
    }

    let next = 0;
    if (e.key === 'ArrowDown') next = Math.min(buttons.length - 1, idx + 1);
    if (e.key === 'ArrowUp')   next = Math.max(0, idx - 1);

    buttons[next]?.focus();
    e.preventDefault();
  };

  React.useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => {
      const root = listRef.current;
      if (!root) return;
      const firstBtn = root.querySelector<HTMLElement>('[data-nav="btn"]');
      firstBtn?.focus();
    }, 0);
    return () => clearTimeout(id);
  }, [open]);

  return (
    <Drawer
  variant={isMobile ? 'temporary' : 'persistent'}
  open={open}
  onClose={onClose}
  ModalProps={{ keepMounted: true }}
  sx={{
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      border:'none',
      width: drawerWidth,
      boxSizing: 'border-box',
      bgcolor: '#7162BA',
      borderRadius: '10px',
      mt: sidebarTopMargin,
      mb: '0px',
      height: sidebarHeight,
      ml: '10px',
      mr: '10px',
      transition: 'height 0.3s ease, margin-top 0.3s ease',
    },
  }}
>
  <DrawerHeader sx={{ 
    height: scrollY > 50 ? '0px' : '64px', 
    minHeight: scrollY > 50 ? '0px' : '64px',
    transition: 'height 0.3s ease, min-height 0.3s ease',
    overflow: 'hidden'
  }}>
    
  </DrawerHeader>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <List
          ref={listRef}
          onKeyDown={onListKeyDown}
          tabIndex={0}
          sx={{ pt: 0.5 ,color:'white'}}
        >
            {showDashboard && (
            <ListItem disablePadding>
              <ListItemButton 
                data-nav="btn" 
                selected={active('/dashboard')} 
                onClick={() => nav('/dashboard')}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'white',
                    borderRadius: '25px 0 0 25px',
                    ml: 1,
                    '& .MuiListItemText-primary': {
                      color: 'black',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'black',
                    },
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'white',
                  },
                }}
              >
               <ListItemText primary="Dashboard" sx={{paddingLeft:5}}/>
                 <ListItemIcon sx={{color:'white',fontSize:25}}><IoHome /></ListItemIcon>
                 
              </ListItemButton>
            </ListItem>
          )}

          {showInventory && (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  data-nav="btn"
                  selected={active('/inventory') && !(query ? true : false)}
                  onClick={() => setInvOpen(v => !v)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'white',
                      borderRadius: '25px 0 0 25px',
                      ml: 1,
                      '& .MuiListItemText-primary': {
                        color: 'black',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'black',
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'black',
                      },
                    },
                    '&.Mui-selected:hover': {
                      backgroundColor: 'white',
                    },
                  }}
                >
                   <ListItemText primary="Inventory" sx={{paddingLeft:5}} />
                   <ListItemIcon sx={{color:'white',fontSize:25,paddingLeft:3}}><Inventory /></ListItemIcon>
                  {(query ? true : invOpen) ? <ExpandLess sx={{color:'white'}} /> : <ExpandMore sx={{color:'white'}} />}
                </ListItemButton>
              </ListItem>

              <Collapse in={query ? true : invOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {filteredInvChildren.map(child => (
                    <ListItem key={child.path} disablePadding>
                      <ListItemButton
                        data-nav="btn"
                        sx={{ 
                          pl: 6,
                          '&.Mui-selected': {
                            backgroundColor: 'white',
                            borderRadius: '25px 0 0 25px',
                            ml: 1,
                            '& .MuiListItemText-primary': {
                              color: 'black',
                            },
                            '& .MuiListItemIcon-root': {
                              color: 'black',
                            },
                          },
                          '&.Mui-selected:hover': {
                            backgroundColor: 'white',
                          },
                        }}
                        selected={active(child.path)}
                        onClick={() => nav(child.path)}
                      >
                         <ListItemText primary={child.text} sx={{paddingLeft:5}}/>
                         <ListItemIcon sx={{color:'white',fontSize:25}}>{child.icon}</ListItemIcon>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </>
          )}

          {filteredMenuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton 
                data-nav="btn" 
                selected={active(item.path)} 
                onClick={() => nav(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'white',
                    borderRadius: '25px 0 0 25px',
                    ml: 1,
                    '& .MuiListItemText-primary': {
                      color: 'black',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'black',
                    },
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'white',
                  },
                }}
              >
                 <ListItemText primary={item.text} sx={{paddingLeft:5}}/>
                 <ListItemIcon sx={{color:'white',fontSize:25}}>{item.icon}</ListItemIcon>
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 'auto' }} />
        {authUser ? (
          //signed in
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 36, height: 36 ,color:'black',backgroundColor:'white'}}>{initials}</Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{color:'white'}}>{displayName}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{color:'white'}}>{subline}</Typography>
            </Box>
            <Tooltip title="Logout">
              <IconButton
                size="small"
                onClick={async () => {
                  await logout();
                  if (isMobile) onClose();
                }}
                aria-label="Logout"
              >
                <Logout fontSize="small" sx={{color:'white'}} />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          //not signed in
          <Box sx={{ p: 2 ,width:200}} >
            <Button 
              fullWidth
              variant="contained"
              onClick={() => {
                loginGoogle({ forceAccountPicker: true });
                if (isMobile) onClose();
              }}
              sx={{
                paddingRight:5,
                textTransform: 'none', 
                fontSize:25,
                bgcolor: '#7162BA',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(110, 30, 202, 0.9)',
                }
              }}
            ><IoPerson />
                    Sign In
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};
