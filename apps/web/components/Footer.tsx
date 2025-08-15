// apps/web/app/layout.tsx
'use client';

import React from 'react';
import { Box, Typography, Link, IconButton, Tooltip, Container } from '@mui/material';
import { GitHub, LinkedIn, Instagram, Facebook, ArrowUpward } from '@mui/icons-material';

// Conditional links based on props
interface FooterProps {
  showSocialLinks?: boolean;
  companyName?: string;
  logoSrc?: string;
}

export const Footer: React.FC<FooterProps> = ({
  showSocialLinks = true,
  companyName = 'Inventory Management System',
  logoSrc = '/logo.png',
}) => {
  
  // Dynamic year
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#f5f5f5',
        py: 2,
        mt: 'auto', // This pushes footer to bottom
        borderTop: '1px solid #e0e0e0',
      }}>
      <Container maxWidth="lg">

        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'center', md: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },       
            textAlign: { xs: 'center', md: 'left' },
            gap: { xs: 1.5, md: 2 },
          }}>
          

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Left side - Copyright */}
            <Link href="/" underline="none" aria-label={`${companyName} home`}>
              <Box
                component="img"
                src={logoSrc}
                alt={`${companyName} logo`}
                sx={{ height: 28, width: 'auto', display: 'block' }}
              />
            </Link>
            <Typography variant="body2" color="primary">
              © {currentYear} {companyName}
            </Typography>
          </Box>

          {/* Center - Links */}    
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',                               
              justifyContent: { xs: 'center', md: 'center' }, 
            }}>

            <Link href="/about" underline="hover">About</Link>
            <Link href="/hover" underline="hover">Contact</Link>
            <Link href="/privacy" underline="hover">Privacy</Link>
            <Link href="/terms" underline="hover">Terms of Service</Link>
            <Link href="/help" underline="hover">Help</Link>
          </Box>
            
          {/* Right side - Social Icons */}
          {showSocialLinks && (
            <Box
              sx={{
                display: 'flex',
                gap: 0.5,
                flexWrap: 'wrap',                              
                justifyContent: { xs: 'center', md: 'flex-end' },
                mt: { xs: 0.5, md: 0 },                        
              }}>
              <Tooltip title="GitHub" arrow placement="top">
                <IconButton href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" color="primary">
                  <GitHub />
                </IconButton>
              </Tooltip>
              <Tooltip title="LinkedIn" arrow placement="top">
                <IconButton href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" color="primary">
                  <LinkedIn />
                </IconButton>
              </Tooltip>
              <Tooltip title="Instagram" arrow placement="top">
                <IconButton href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" color="primary">
                  <Instagram />
                </IconButton>
              </Tooltip>
              <Tooltip title="Facebook" arrow placement="top">
                <IconButton href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" color="primary">
                  <Facebook />
                </IconButton>
              </Tooltip>
              <Tooltip title="Back to Top" arrow placement="top">
                <IconButton onClick={scrollToTop} aria-label="Back to top" color="primary">
                  <ArrowUpward />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};
