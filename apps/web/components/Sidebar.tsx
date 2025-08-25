'use client';

import * as React from 'react';
import {Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,Box, Divider, Collapse, TextField, InputAdornment, useMediaQuery, useTheme,Badge, Avatar, Tooltip, IconButton, Typography} from '@mui/material';
import {Dashboard, Inventory, People, ShoppingCart, Assessment,ExpandLess, ExpandMore, Inventory2, Category, Search as SearchIcon,Settings, Logout} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { styled } from '@mui/material/styles';
import ChevronLeft from '@mui/icons-material/ChevronLeft';

const drawerWidth = 240;

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
}
//  DrawerHeader 
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

  // Badges
  const inventoryBadge = 3;
  const customersDot = true;
  const ordersBadge = 12;     

  // user 
  const user = { name: 'Yusuf Baba', role: 'Admin', initials: 'YB' };

  // Search
  const [q, setQ] = React.useState('');
  const query = q.trim().toLowerCase();
  const match = (label: string) => label.toLowerCase().includes(query);

  // Collapsible
  const [invOpen, setInvOpen] = React.useState(() => pathname.startsWith('/inventory'));

  const nav = (path: string) => {
    router.push(path as any); 
    if (isMobile) onClose();
  };
  const active = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  // Inventory children
  const inventoryChildren = [
    {text:'Products',path:'/inventory/products',icon: <Inventory2 /> },
    {text:'Categories',path:'/categories',icon: <Category />   },];

  const filteredInvChildren = query ? inventoryChildren.filter(c => match(c.text)) : inventoryChildren;

  const showDashboard = !query || match('Dashboard');
  const showInventory = !query || match('Inventory') || filteredInvChildren.length > 0;

  //Inventory open searching
  const inventoryExpanded = query ? true : invOpen;

  const menuItems = [
    {text: 'Customers',path: '/customers',icon: <People />,badgeDot:customersDot },
    {text: 'Orders',path: '/orders',icon: <ShoppingCart />,badgeCount:ordersBadge },
    {text: 'Reports',path: '/reports',icon: <Assessment /> },
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
    if (t.tagName === 'INPUT' || t.closest('input')) return; // ignore when typing search
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

    const root = listRef.current;
    if (!root) return;

    const buttons = Array.from(root.querySelectorAll<HTMLElement>('[data-nav="btn"]'));
    if (buttons.length === 0) return;

    const cur = document.activeElement as HTMLElement | null;
    const idx = buttons.findIndex(el => el === cur || (cur && el.contains(cur)));

    //focused first item
    if (idx === -1) {
      buttons[0]?.focus();
      e.preventDefault();
      return;
    }

    let next = 0;
    if (e.key === 'ArrowDown') next = idx >= 0 ? Math.min(buttons.length - 1, idx + 1) : 0;
    if (e.key === 'ArrowUp')   next = idx >= 0 ? Math.max(0, idx - 1) : buttons.length - 1;

    buttons[next]?.focus();
    e.preventDefault();
  };

  //auto-focus first item 
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
      //ChevronRight given code
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
      }}>
  
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/*DrawerHeader given code*/}
        <DrawerHeader>
          <IconButton onClick={onClose} aria-label="Close sidebar">
            <ChevronLeft />
          </IconButton>
        </DrawerHeader>
        <Divider />

        {/* Search */}
        <Box sx={{ p: 1, pb: 0.5, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
          <TextField size="small" fullWidth placeholder="Search menu…" value={q} onChange={(e) => setQ(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Menu given code*/}
        <List
          ref={listRef}
          onKeyDown={onListKeyDown}
          tabIndex={0}              // NEW: make list focusable so it receives key events
          sx={{ pt: 0.5 }}
        >
          {/* Dashboard given code */}
          {showDashboard && (
            <ListItem disablePadding>
              <ListItemButton data-nav="btn" selected={active('/dashboard')} onClick={() => nav('/dashboard')}>
                <ListItemIcon><Dashboard /></ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
          )}

          {/* Inventory badge and collapsible children) */}
          {showInventory && (
            <>
              <ListItem disablePadding>
                <ListItemButton data-nav="btn" selected={active('/inventory') && !inventoryExpanded} onClick={() => setInvOpen(v => !v)} >
                  <ListItemIcon>
                    <Badge color="error" variant="standard"  badgeContent={inventoryBadge} >
                      <Inventory />
                    </Badge>
                  </ListItemIcon>
                  <ListItemText primary="Inventory" />

                  {inventoryExpanded ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>

              <Collapse in={inventoryExpanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {filteredInvChildren.map(child => (
                    <ListItem key={child.path} disablePadding>
                      <ListItemButton data-nav="btn" sx={{ pl: 6 }} selected={active(child.path)} onClick={() => nav(child.path)} >
                        <ListItemIcon>{child.icon}</ListItemIcon>
                        <ListItemText primary={child.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </>
          )}

          {/* menuItems Customers,Orders,Report*/}
          {filteredMenuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton data-nav="btn" selected={active(item.path)} onClick={() => nav(item.path)} >
                <ListItemIcon>
                  {/*badges*/}
                  {'badgeCount' in item && item.badgeCount !== undefined ? (
                    <Badge color="error" variant="standard" badgeContent={item.badgeCount} invisible={!item.badgeCount}>
                      {item.icon}
                    </Badge>
                  ) : 'badgeDot' in item && item.badgeDot !== undefined ? (
                    <Badge color="error" variant="dot" invisible={!item.badgeDot}>
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Pushed down profile*/}
        <Box sx={{ mt: 'auto' }} />
        <Divider />

        {/* User Profile*/}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36 }}>{user.initials}</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap>{user.name}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{user.role}</Typography>
          </Box>
          <Tooltip title="Profile & Settings">
            <IconButton size="small" onClick={() => { router.push('/profile' as any); if (isMobile) onClose(); }} aria-label="Open profile & settings">
              <Settings fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Logout">
            <IconButton size="small" onClick={() => { router.push('/logout' as any); if (isMobile) onClose(); }} aria-label="Logout">
              <Logout fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );  
};
