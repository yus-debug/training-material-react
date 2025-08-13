# Task 3: Create a Sidebar Navigation Menu

**Difficulty: ⭐⭐ (Simple)**  
**Time: 45-60 minutes**  
**Prerequisites: Tasks 1-2 completed**

## 🎯 Learning Goals

- Master React state with `useState`
- Learn event handling and user interactions
- Understand conditional rendering
- Practice with MUI Drawer component
- Learn about responsive design patterns

## 📋 Task Description

Create a collapsible sidebar navigation menu with icons and responsive behavior.

## 🏗️ What You'll Build

```
┌─────┬───────────────────────────────────────────┐
│ [≡] │ Header                                    │
├─────┼───────────────────────────────────────────┤
│ 📊  │                                           │
│ 📦  │         Main Content Area                 │
│ 👥  │                                           │
│ 📋  │                                           │
│ 📈  │                                           │
└─────┴───────────────────────────────────────────┘
```

## 📁 Files to Create/Modify

- `apps/web/components/Sidebar.tsx` (new file)
- `apps/web/components/Header.tsx` (add menu button)
- `apps/web/app/layout.tsx` (include sidebar)

## ✅ Requirements

- [ ] Create collapsible sidebar using MUI Drawer
- [ ] Add menu items: Dashboard, Inventory, Customers, Orders, Reports
- [ ] Include icons for each menu item
- [ ] Add toggle button in header to open/close sidebar
- [ ] Highlight active menu item
- [ ] Make responsive (auto-collapse on mobile)
- [ ] Smooth animations for open/close

## 💡 Hints & Guidance

### Step 1: Create Sidebar Component

```tsx
// apps/web/components/Sidebar.tsx
import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard,
  Inventory,
  People,
  ShoppingCart,
  Assessment,
  ChevronLeft
} from '@mui/icons-material';

const drawerWidth = 240;

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      open={isOpen}
      onClose={handleToggle}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      {/* Your content here */}
    </Drawer>
  );
};
```

### Step 2: Create Menu Items

```tsx
const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Inventory', icon: <Inventory />, path: '/inventory' },
  { text: 'Customers', icon: <People />, path: '/customers' },
  { text: 'Orders', icon: <ShoppingCart />, path: '/orders' },
  { text: 'Reports', icon: <Assessment />, path: '/reports' },
];

// In your JSX:
<List>
  {menuItems.map((item) => (
    <ListItem key={item.text} disablePadding>
      <ListItemButton>
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText primary={item.text} />
      </ListItemButton>
    </ListItem>
  ))}
</List>
```

### Step 3: Add Toggle Button to Header

```tsx
// apps/web/components/Header.tsx - Update your header
import { IconButton } from '@mui/material';
import { Menu } from '@mui/icons-material';

// Add this prop to Header component
interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <Menu />
        </IconButton>
        {/* Rest of your header */}
      </Toolbar>
    </AppBar>
  );
};
```

### Step 4: Connect in Layout

```tsx
// apps/web/app/layout.tsx
import { useState } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <html lang="en">
      <body>
        <Providers>
          <Box sx={{ display: 'flex' }}>
            <Header onMenuClick={handleMenuClick} />
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              {children}
            </Box>
          </Box>
        </Providers>
      </body>
    </html>
  );
}
```

## 🔧 State Management

```tsx
// useState for sidebar state
const [isOpen, setIsOpen] = useState(false);

// Toggle function
const handleToggle = () => {
  setIsOpen(prevState => !prevState);
};

// Close on mobile after click
const handleItemClick = () => {
  if (isMobile) {
    setIsOpen(false);
  }
};
```

## 📱 Responsive Behavior

```tsx
// Detect mobile screen
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('md'));

// Different drawer variants
<Drawer
  variant={isMobile ? "temporary" : "persistent"}
  open={isOpen}
  onClose={handleToggle}
  ModalProps={{
    keepMounted: true, // Better mobile performance
  }}
>
```

## 🎨 Active Menu Highlighting

```tsx
const [activeItem, setActiveItem] = useState('Dashboard');

// In your ListItemButton:
<ListItemButton
  selected={activeItem === item.text}
  onClick={() => {
    setActiveItem(item.text);
    handleItemClick();
  }}
>
```

## ✨ Bonus Features

```tsx
// Add drawer header with close button
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

// Usage:
<DrawerHeader>
  <IconButton onClick={handleToggle}>
    <ChevronLeft />
  </IconButton>
</DrawerHeader>
```

## 🐛 Common Issues & Solutions

**Issue**: Sidebar overlaps content
**Solution**: Use `persistent` variant for desktop and adjust main content margin

**Issue**: Mobile sidebar doesn't close after clicking
**Solution**: Add `onClose` handler and close sidebar on item click for mobile

**Issue**: Icons not showing
**Solution**: Import icons from `@mui/icons-material`

## ✨ Bonus Challenges

- [ ] Add user profile section at bottom of sidebar
- [ ] Implement navigation routing (use Next.js router)
- [ ] Add badges for notifications on menu items
- [ ] Create collapsible sub-menus
- [ ] Add search functionality in sidebar
- [ ] Implement keyboard navigation (arrow keys)

## ✅ How to Test

1. Click menu button in header - sidebar should open
2. Click outside sidebar (on mobile) - should close
3. Test all menu items are visible with icons
4. Verify responsive behavior on different screen sizes
5. Check active item highlighting works

## 🎉 Completion Criteria

Your sidebar is complete when:
- ✅ Sidebar opens/closes with menu button
- ✅ All 5 menu items are visible with icons
- ✅ Responsive behavior works (temporary on mobile, persistent on desktop)
- ✅ Active menu item is highlighted
- ✅ Smooth animations work
- ✅ No layout issues or overlapping content

---

**← Previous: [Task 2 - Footer Component](./task-02-footer.md)**  
**Next Step: [Task 4 - Dashboard with Cards](./task-04-dashboard.md) →**
