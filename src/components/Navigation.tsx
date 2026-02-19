import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import LightModeIcon from '@mui/icons-material/LightMode';
import List from '@mui/material/List';
import ListIcon from '@mui/icons-material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';

const drawerWidth = 240;

// Type-safe navigation items
interface NavItem {
  label: string;
  id: string;
  isPage?: boolean; // true for items that open separate pages
}

// In-page sections (scroll to)
const sectionItems: NavItem[] = [
  { label: 'Home', id: 'home' },
  { label: 'Expertise', id: 'expertise' },
  { label: 'History', id: 'history' },
  { label: 'Contact', id: 'contact' },
];

// Separate pages
const pageItems: NavItem[] = [
  { label: 'Projects', id: 'projects', isPage: true },
  { label: 'Blogs', id: 'blog', isPage: true },
];

// Combined for easy iteration
const allNavItems = [...sectionItems, ...pageItems];

// Items that navigate to separate pages instead of scrolling
const pageNavItems = pageItems.map(item => item.id);

interface NavigationProps {
  parentToChild: { mode: string };
  modeChange: () => void;
}

function Navigation({parentToChild, modeChange}: NavigationProps) {

  const {mode} = parentToChild;
  const location = useLocation();
  const navigate = useNavigate();
  const isSubPage = location.pathname.startsWith('/blog') || location.pathname.startsWith('/projects');

  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const scrollIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.getElementById("navigation");
      if (navbar) {
        const scrolled = window.scrollY > navbar.clientHeight;
        setScrolled(scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, []);

  const scrollToSection = (section: string) => {
    // Handle page navigation items (blog, projects)
    if (pageNavItems.includes(section)) {
      navigate(`/${section}`);
      return;
    }

    if (isSubPage) {
      navigate('/');
      // Clear any existing scroll interval before starting a new one
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
      let attempts = 0;
      scrollIntervalRef.current = setInterval(() => {
        const el = document.getElementById(section);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          clearInterval(scrollIntervalRef.current!);
          scrollIntervalRef.current = null;
        } else if (++attempts >= 20) {
          clearInterval(scrollIntervalRef.current!);
          scrollIntervalRef.current = null;
        }
      }, 100);
      return;
    }

    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.error(`Element with id "${section}" not found`);
    }
  };

  const drawer = (
    <Box className="navigation-bar-responsive" onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <p className="mobile-menu-top"><ListIcon/>Menu</p>
      <Divider />
      <List>
        {sectionItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton sx={{ textAlign: 'center' }} onClick={() => scrollToSection(item.id)}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 1 }}>
        <span style={{ fontSize: '0.75rem', opacity: 0.6, padding: '0 8px' }}>Pages</span>
      </Divider>
      <List>
        {pageItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton sx={{ textAlign: 'center' }} onClick={() => scrollToSection(item.id)}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar component="nav" id="navigation" className={`navbar-fixed-top${scrolled ? ' scrolled' : ''}`}>
        <Toolbar className='navigation-bar'>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          {mode === 'dark' ? (
            <IconButton onClick={() => modeChange()} aria-label="Switch to light mode" color="inherit">
              <LightModeIcon />
            </IconButton>
          ) : (
            <IconButton onClick={() => modeChange()} aria-label="Switch to dark mode" color="inherit">
              <DarkModeIcon />
            </IconButton>
          )}
          <Box sx={{ display: { xs: 'none', sm: 'block' }, alignItems: 'center' }}>
            {sectionItems.map((item) => (
              <Button key={item.id} onClick={() => scrollToSection(item.id)} sx={{ color: 'inherit' }}>
                {item.label}
              </Button>
            ))}
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                width: '1px',
                height: '20px',
                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
                mx: 1.5,
                verticalAlign: 'middle',
              }}
              aria-hidden="true"
            />
            {pageItems.map((item) => (
              <Button key={item.id} onClick={() => scrollToSection(item.id)} sx={{ color: 'inherit' }}>
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: mode === 'dark' ? '#1d2c39' : '#f8f9fa',
              color: mode === 'dark' ? '#f0f0f0' : '#0d1116',
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </Box>
  );
}

export default Navigation;