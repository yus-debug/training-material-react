# Task 1: Create a Simple Header Component
## Olivium React Training - Task 1

**Difficulty: ⭐ (Super Simple)**  
**Time: 15-30 minutes**  
**Prerequisites: None**

## 🎯 Learning Goals

- Understand React functional components
- Learn JSX syntax and structure
- Practice with MUI components
- Learn component props and basic styling

## 📋 Task Description

Create a header component that displays the app title and navigation menu using Material-UI components.

## 🏗️ What You'll Build

```
┌─────────────────────────────────────────────────────────────┐
│ [LOGO] Inventory Management System    [Home] [Inventory] [Reports] │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Files to Create/Modify

- `apps/web/components/Header.tsx` (new file)
- `apps/web/app/layout.tsx` (modify to include header)

## ✅ Requirements

- [ ] Create a `Header` functional component
- [ ] Display "Inventory Management System" as the title
- [ ] Add navigation links: Home, Inventory, Reports
- [ ] Use MUI `AppBar` and `Toolbar` components
- [ ] Style with a nice background color
- [ ] Make it responsive

## 💡 Hints & Guidance

### Step 1: Create the Header Component

```tsx
// apps/web/components/Header.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

export const Header: React.FC = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        {/* Add your content here */}
      </Toolbar>
    </AppBar>
  );
};
```

### Step 2: Add the Title

```tsx
<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
  Inventory Management System
</Typography>
```

### Step 3: Add Navigation Buttons

```tsx
<Box sx={{ display: 'flex', gap: 2 }}>
  <Button color="inherit">Home</Button>
  <Button color="inherit">Inventory</Button>
  <Button color="inherit">Reports</Button>
</Box>
```

### Step 4: Include in Layout

```tsx
// apps/web/app/layout.tsx
import { Header } from '../components/Header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

## 🔧 MUI Components to Use

- **`AppBar`**: Main header container
- **`Toolbar`**: Content container within AppBar
- **`Typography`**: For the title text
- **`Button`**: For navigation links
- **`Box`**: For layout and spacing

## 🎨 Styling Tips

```tsx
// Use sx prop for styling
sx={{
  backgroundColor: '#1976d2',  // Custom color
  flexGrow: 1,                // Take available space
  display: 'flex',            // Flexbox layout
  gap: 2,                     // Spacing between items
}}
```

## 🐛 Common Issues & Solutions

**Issue**: Header not showing up
**Solution**: Make sure you imported and included `<Header />` in your layout

**Issue**: Buttons not aligned properly
**Solution**: Use `flexGrow: 1` on title and `display: 'flex'` on button container

**Issue**: TypeScript errors
**Solution**: Make sure to import React and use proper typing

## 🔗 Useful Links

- [MUI AppBar Documentation](https://mui.com/material-ui/react-app-bar/)
- [MUI Toolbar](https://mui.com/material-ui/api/toolbar/)
- [React Function Components](https://react.dev/reference/react/Component#alternatives)

## ✨ Bonus Challenges

Once you complete the basic task, try these improvements:

- [ ] Add a logo icon next to the title
- [ ] Make navigation links highlight when active
- [ ] Add a mobile-responsive hamburger menu
- [ ] Include a search icon in the header
- [ ] Add hover effects to buttons

## ✅ How to Test

1. Start your development server: `pnpm dev`
2. Open http://localhost:3040
3. You should see your header at the top of the page
4. Verify all navigation buttons are visible
5. Check that it looks good on different screen sizes

## 🎉 Completion Criteria

Your header is complete when:
- ✅ Header renders without errors
- ✅ Title "Inventory Management System" is displayed
- ✅ Three navigation buttons are visible
- ✅ Header has a nice background color
- ✅ Layout is responsive and looks professional

---

**Next Step: [Task 2 - Create a Footer Component](./task-02-footer.md) →**
