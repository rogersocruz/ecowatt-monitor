// src/components/MainLayout.jsx
import React from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Home as HomeIcon, CalendarToday as CalendarIcon, Power as PowerIcon, Settings as SettingsIcon, ExitToApp as ExitIcon } from '@mui/icons-material';
import { Link, Outlet } from 'react-router-dom'; // IMPORTANTE: Adicionado 'Outlet' aqui

const drawerWidth = 240;

// Definição das Páginas do Menu
const menuItems = [
  { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
  { text: 'Calendário', icon: <CalendarIcon />, path: '/calendar' },
  { text: 'Gerenciar Dispositivos', icon: <PowerIcon />, path: '/devices' },
  { text: 'Metas e Relatórios', icon: <SettingsIcon />, path: '/reports' },
];

// Corrigido para usar Outlet, eliminando a prop 'children'
const MainLayout = () => { 
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* 1. Header (AppBar) */}
      <AppBar 
        position="fixed" 
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            EcoWatt Monitor
          </Typography>
        </Toolbar>
      </AppBar>
      
      {/* 2. Menu Lateral (Sidebar - Drawer) */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
            <Typography variant="h5" color="primary">
                E C O W A T T
            </Typography>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={Link} to={item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ mt: 'auto' }} />
        {/* Item de Logout */}
        <List>
            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemIcon><ExitIcon /></ListItemIcon>
                    <ListItemText primary="Sair" />
                </ListItemButton>
            </ListItem>
        </List>

      </Drawer>
      
      {/* 3. Conteúdo Principal - ONDE O CONTEÚDO DA ROTA VAI */}
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar /> {/* Espaçamento para o Header */}
        
        {/* Usamos Outlet para renderizar o componente da rota aninhada (/dashboard, /calendar, etc.) */}
        <Outlet /> 
      </Box>
    </Box>
  );
};

export default MainLayout;