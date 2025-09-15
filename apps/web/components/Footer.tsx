// apps/web/app/layout.tsx
'use client';

import React from 'react';
import { Box, Typography, Link, IconButton, Tooltip, Container } from '@mui/material';
import { GitHub, LinkedIn, Instagram, Facebook, ArrowUpward } from '@mui/icons-material';
import { RiInstagramFill } from "react-icons/ri";
import { FaFacebook } from "react-icons/fa";
//  links
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
  
  // year
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
        backgroundColor: '#FBA43C',
        py: 2,
        mt: 'auto',
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
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5}}>
            {/*Copyright*/}
            <Typography sx={{color:'white', fontSize:'15'}}>
              © {currentYear} {companyName}
            </Typography>
          </Box>

          {/*Links*/}    
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',                               
              justifyContent: { xs: 'center', md: 'center' }, 
            }}>

            <Link href="/about" sx={{color:'white',textDecoration:'none'}}>About</Link>
            <Link href="/hover" sx={{color:'white',textDecoration:'none'}}>Contact</Link>
            <Link href="/privacy" sx={{color:'white',textDecoration:'none'}}>Privacy</Link>
            <Link href="/terms" sx={{color:'white',textDecoration:'none'}}>Terms of Service</Link>
            <Link href="/help"  sx={{color:'white',textDecoration:'none'}}>Help</Link>
          </Box>
            
          {/*Icons*/}
          {showSocialLinks && (
            <Box
              sx={{
                display: 'flex',
                gap: 0.5,
                flexWrap: 'wrap',                              
                justifyContent: { xs: 'center', md: 'flex-end' },
                mt: { xs: 0.5, md: 0 },                        
              }}>{/* 
              <Tooltip title="GitHub" arrow placement="top">
                <IconButton href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" color="primary">
                  <GitHub />
                </IconButton>
              </Tooltip>*/}

              <Tooltip title="Instagram" arrow placement="top">
                <IconButton href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" sx={{color:'white'}}>
                  <RiInstagramFill />
                </IconButton>
              </Tooltip>
              <Tooltip title="LinkedIn" arrow placement="top">
                <IconButton href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" sx={{color:'white'}} >
                  <LinkedIn />
                </IconButton>
              </Tooltip>
              <Tooltip title="Facebook" arrow placement="top">
                <IconButton href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" sx={{color:'white'}}>
                  <FaFacebook />
                </IconButton>
              </Tooltip>
              {/* 
              <Tooltip title="Back to Top" arrow placement="top">
                <IconButton onClick={scrollToTop} aria-label="Back to top" color="primary">
                  <ArrowUpward />
                </IconButton>
              </Tooltip>*/}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};
