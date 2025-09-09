'use client';

import * as React from 'react';
import {Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Divider, Collapse,TextField, InputAdornment, useMediaQuery, useTheme, Avatar, Tooltip, IconButton, Typography} from '@mui/material';
import {Dashboard, Inventory, People, ShoppingCart, Assessment, ExpandLess, ExpandMore,Inventory2, Category, Search as SearchIcon, Logout} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { styled } from '@mui/material/styles';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import { useAuth } from '../contexts/AuthContext';

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
  const { user: authUser, logout } = useAuth();

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
  const active = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  //Inventory children
  const inventoryChildren = [
    { text: 'Products', path: '/products', icon: <Inventory2 /> },
    { text: 'Categories', path: '/categories', icon: <Category /> },
  ];

  const filteredInvChildren = query ? inventoryChildren.filter(c => match(c.text)) : inventoryChildren;

  const showDashboard = !query || match('Dashboard');
  const showInventory = !query || match('Inventory') || filteredInvChildren.length > 0;

  const menuItems = [
    { text: 'Customers', path: '/customers', icon: <People /> },
    { text: 'Orders', path: '/orders', icon: <ShoppingCart /> },
    { text: 'Reports', path: '/reports', icon: <Assessment /> },
  ] as const;

  const filteredMenuItems = menuItems.filter(
    (item) => !query || item.text.toLowerCase().includes(query)
  );

  //Esc closes
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  //Up/Down
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

  //focus first item
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
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <DrawerHeader>
          <IconButton onClick={onClose} aria-label="Close sidebar">
            <ChevronLeft />
          </IconButton>
        </DrawerHeader>
        <Divider />

        {/*Search */}
        <Box sx={{ p: 1, pb: 0.5, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search menu…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <List
          ref={listRef}
          onKeyDown={onListKeyDown}
          tabIndex={0}
          sx={{ pt: 0.5 }}
        >
          {showDashboard && (
            <ListItem disablePadding>
              <ListItemButton data-nav="btn" selected={active('/dashboard')} onClick={() => nav('/dashboard')}>
                <ListItemIcon><Dashboard /></ListItemIcon>
                <ListItemText primary="Dashboard" />
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
                >
                  <ListItemIcon><Inventory /></ListItemIcon>
                  <ListItemText primary="Inventory" />
                  {(query ? true : invOpen) ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>

              <Collapse in={query ? true : invOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {filteredInvChildren.map(child => (
                    <ListItem key={child.path} disablePadding>
                      <ListItemButton
                        data-nav="btn"
                        sx={{ pl: 6 }}
                        selected={active(child.path)}
                        onClick={() => nav(child.path)}
                      >
                        <ListItemIcon>{child.icon}</ListItemIcon>
                        <ListItemText primary={child.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </>
          )}

          {filteredMenuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton data-nav="btn" selected={active(item.path)} onClick={() => nav(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 'auto' }} />
        <Divider />
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36 }}>{initials}</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap>{displayName}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{subline}</Typography>
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
              <Logout fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
};
