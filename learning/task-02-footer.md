# Task 2: Create a Footer Component

**Difficulty: ⭐ (Super Simple)**  
**Time: 15-20 minutes**  
**Prerequisites: Task 1 completed**

## 🎯 Learning Goals

- Practice component composition
- Learn about CSS positioning and layout
- Understand props and component reusability
- Practice with MUI styling system

## 📋 Task Description

Create a footer component that displays copyright information, useful links, and social media icons. Make it stick to the bottom of the page.

## 🏗️ What You'll Build

```
┌─────────────────────────────────────────────────────────────┐
│ © 2025 Inventory System  [About] [Contact] [Privacy]  [GitHub] [LinkedIn] │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Files to Create/Modify

- `apps/web/components/Footer.tsx` (new file)
- `apps/web/app/layout.tsx` (modify to include footer)

## ✅ Requirements

- [ ] Create a `Footer` functional component
- [ ] Display copyright notice with current year
- [ ] Add useful links: About, Contact, Privacy
- [ ] Include social media icons (GitHub, LinkedIn)
- [ ] Make it stick to the bottom of the page
- [ ] Use MUI Paper or Box component for styling

## 💡 Hints & Guidance

### Step 1: Create the Footer Component

```tsx
// apps/web/components/Footer.tsx
import React from 'react';
import { Box, Typography, Link, IconButton } from '@mui/material';
import { GitHub, LinkedIn } from '@mui/icons-material';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#f5f5f5',
        padding: 2,
        marginTop: 'auto', // This pushes footer to bottom
        borderTop: '1px solid #e0e0e0'
      }}
    >
      {/* Add your content here */}
    </Box>
  );
};
```

### Step 2: Add Copyright and Links

```tsx
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  {/* Left side - Copyright */}
  <Typography variant="body2" color="text.secondary">
    © {currentYear} Inventory Management System
  </Typography>
  
  {/* Center - Links */}
  <Box sx={{ display: 'flex', gap: 2 }}>
    <Link href="#" underline="hover">About</Link>
    <Link href="#" underline="hover">Contact</Link>
    <Link href="#" underline="hover">Privacy</Link>
  </Box>
  
  {/* Right side - Social Icons */}
  <Box>
    <IconButton href="https://github.com" target="_blank">
      <GitHub />
    </IconButton>
    <IconButton href="https://linkedin.com" target="_blank">
      <LinkedIn />
    </IconButton>
  </Box>
</Box>
```

### Step 3: Make Footer Stick to Bottom

```tsx
// apps/web/app/layout.tsx
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box component="main" sx={{ flexGrow: 1 }}>
              {children}
            </Box>
            <Footer />
          </Box>
        </Providers>
      </body>
    </html>
  );
}
```

## �� MUI Components to Use

- **`Box`**: Main container and layout
- **`Typography`**: For copyright text
- **`Link`**: For clickable links
- **`IconButton`**: For social media icons
- **`GitHub`, `LinkedIn`**: Icons from @mui/icons-material

## 🎨 Styling Tips

```tsx
// Responsive design
sx={{
  display: 'flex',
  justifyContent: 'space-between',    // Spread items across
  alignItems: 'center',               // Center vertically
  flexDirection: { xs: 'column', md: 'row' }, // Stack on mobile
  gap: 2,                             // Spacing between items
  backgroundColor: '#f5f5f5',         // Light gray background
  borderTop: '1px solid #e0e0e0',     // Top border
}}
```

## 🔧 Make It Dynamic

```tsx
// Dynamic year
const currentYear = new Date().getFullYear();

// Conditional links based on props
interface FooterProps {
  showSocialLinks?: boolean;
  companyName?: string;
}

export const Footer: React.FC<FooterProps> = ({ 
  showSocialLinks = true, 
  companyName = "Inventory Management System" 
}) => {
  // Use props in your component
};
```

## 🐛 Common Issues & Solutions

**Issue**: Footer not sticking to bottom
**Solution**: Use `minHeight: '100vh'` on body and `marginTop: 'auto'` on footer

**Issue**: Icons not showing
**Solution**: Make sure to install and import `@mui/icons-material`

**Issue**: Layout breaks on mobile
**Solution**: Use responsive flexDirection: `{ xs: 'column', md: 'row' }`

## 📱 Responsive Design

```tsx
// Mobile-first approach
sx={{
  flexDirection: { xs: 'column', md: 'row' },
  textAlign: { xs: 'center', md: 'left' },
  gap: { xs: 1, md: 2 },
}}
```

## ✨ Bonus Challenges

Once you complete the basic task, try these improvements:

- [ ] Add tooltips to social media icons
- [ ] Include a "Back to Top" button
- [ ] Add more social media platforms
- [ ] Create different footer variations (minimal, full)
- [ ] Add company logo to footer
- [ ] Include useful links like Terms of Service

## ✅ How to Test

1. Check that footer appears at bottom of page
2. Verify copyright shows current year
3. Test that links are clickable (even if they don't go anywhere yet)
4. Verify social icons are visible and clickable
5. Test on different screen sizes

## 🎉 Completion Criteria

Your footer is complete when:
- ✅ Footer renders at bottom of page
- ✅ Copyright notice displays current year
- ✅ Navigation links are visible and clickable
- ✅ Social media icons are present
- ✅ Footer looks good on mobile and desktop
- ✅ Footer has appropriate styling and spacing

---

**← Previous: [Task 1 - Header Component](./task-01-header.md)**  
**Next Step: [Task 3 - Sidebar Navigation](./task-03-sidebar.md) →**
