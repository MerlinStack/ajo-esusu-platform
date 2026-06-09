import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Sun,
  Moon,
  Wallet,
  LayoutDashboard,
  ShieldCheck,
  Users,
  Bell,
  BellRing,
  LogOut,
  Menu as MenuIcon,
  X,
  Activity,
  UserCheck,
  Database,
  CircleDot,
  PiggyBank,
  ArrowLeftRight,
} from 'lucide-react';
import useThemeStore from '../store/useThemeStore';
import useAppStore from '../store/useAppStore';
import ConsumerDashboard from '../pages/ConsumerDashboard';
import AdminTerminal from '../pages/AdminTerminal';

const DRAWER_WIDTH = 260;

const AppMainLayout = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const auth = useAppStore((s) => s.auth);
  const users = useAppStore((s) => s.users);
  const notifications = useAppStore((s) => s.notifications);
  const circles = useAppStore((s) => s.circles);
  const transactions = useAppStore((s) => s.transactions);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);
  const switchRole = useAppStore((s) => s.switchRole);
  const logout = useAppStore((s) => s.logout);
  const getTelemetryData = useAppStore((s) => s.getTelemetryData);
  const telemetry = getTelemetryData();

  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const currentUser = auth.currentUser;
  const activeRole = auth.activeRole;
  const isAdmin = activeRole === 'Admin';

  const userNotifs = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id || n.userId === null)
    : [];

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: isDarkMode ? '#0d2137' : '#ffffff' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
        <Wallet size={28} color="#00695c" />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Ajo/Esusu
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: "'JetBrains Mono', monospace" }}>
            Digital Cooperative
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.6rem', letterSpacing: '0.1em' }}>
          Navigation
        </Typography>
        <List dense disablePadding>
          <ListItem disablePadding sx={{ mt: 0.5 }}>
            <ListItemButton
              sx={{
                borderRadius: 2,
                bgcolor: !isAdmin
                  ? isDarkMode ? 'rgba(0,105,92,0.15)' : 'rgba(0,105,92,0.08)'
                  : 'transparent',
                '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: !isAdmin ? 'primary.main' : 'text.secondary' }}>
                <LayoutDashboard size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Consumer Dashboard"
                primaryTypographyProps={{
                  fontSize: '0.85rem',
                  fontWeight: !isAdmin ? 700 : 500,
                  fontFamily: "'JetBrains Mono', 'Inter', sans-serif",
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ mt: 0.5 }}>
            <ListItemButton
              sx={{
                borderRadius: 2,
                bgcolor: isAdmin
                  ? isDarkMode ? 'rgba(255,143,0,0.15)' : 'rgba(255,143,0,0.08)'
                  : 'transparent',
                '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: isAdmin ? 'secondary.main' : 'text.secondary' }}>
                <ShieldCheck size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Admin Terminal"
                primaryTypographyProps={{
                  fontSize: '0.85rem',
                  fontWeight: isAdmin ? 700 : 500,
                  fontFamily: "'JetBrains Mono', 'Inter', sans-serif",
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      <Divider sx={{ mx: 2 }} />

      <Box sx={{ px: 2, py: 1.5, flexGrow: 1 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.6rem', letterSpacing: '0.1em' }}>
          Quick Actions
        </Typography>
        <List dense disablePadding>
          <ListItem disablePadding sx={{ mt: 0.5 }}>
            <ListItemButton sx={{ borderRadius: 2, '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' } }}>
              <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}><CircleDot size={18} /></ListItemIcon>
              <ListItemText primary="Circles" primaryTypographyProps={{ fontSize: '0.85rem', fontFamily: "'JetBrains Mono', 'Inter', sans-serif" }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ mt: 0.5 }}>
            <ListItemButton sx={{ borderRadius: 2, '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' } }}>
              <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}><Database size={18} /></ListItemIcon>
              <ListItemText primary="Ledger" primaryTypographyProps={{ fontSize: '0.85rem', fontFamily: "'JetBrains Mono', 'Inter', sans-serif" }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      <Box sx={{ p: 2, borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: isAdmin ? '#ff8f00' : '#00695c', fontSize: '0.8rem', fontWeight: 700 }}>
            {currentUser?.name?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "'Inter', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.name || 'User'}
            </Typography>
            <Chip
              label={activeRole}
              size="small"
              sx={{
                height: 18, fontSize: '0.6rem',
                bgcolor: isAdmin ? 'rgba(255,143,0,0.15)' : 'rgba(0,105,92,0.15)',
                color: isAdmin ? 'secondary.main' : 'primary.main',
                fontWeight: 700,
              }}
            />
          </Box>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {!isMobile && (
        <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}>
          {drawerContent}
        </Drawer>
      )}

      {isMobile && (
        <Drawer variant="temporary" open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}>
          {drawerContent}
        </Drawer>
      )}

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box sx={{
          bgcolor: isDarkMode ? '#0d2137' : '#00695c',
          px: { xs: 1.5, md: 3 }, py: 0.8,
          display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2.5 }, flexWrap: 'wrap',
          borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.1)',
        }}>
          {isMobile && (
            <IconButton size="small" onClick={() => setDrawerOpen(!drawerOpen)} sx={{ color: '#ffffff' }}>
              {drawerOpen ? <X size={18} /> : <MenuIcon size={18} />}
            </IconButton>
          )}

          <Activity size={14} color="#4ade80" />
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, display: { xs: 'none', sm: 'inline' } }}>
            System Telemetry
          </Typography>

          <Chip
            icon={<ShieldCheck size={12} />}
            label={`Integrity: ${telemetry.ledgerIntegrity}%`}
            size="small"
            sx={{
              fontFamily: "'JetBrains Mono', monospace",
              bgcolor: telemetry.ledgerIntegrity >= 90 ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)',
              color: telemetry.ledgerIntegrity >= 90 ? '#4ade80' : '#ef4444',
              fontWeight: 600, height: 22, fontSize: '0.6rem',
              '& .MuiChip-icon': { fontSize: '0.7rem' },
            }}
          />

          <Chip
            icon={<UserCheck size={12} />}
            label={`${telemetry.activeUsers} Active`}
            size="small"
            sx={{ fontFamily: "'JetBrains Mono', monospace", bgcolor: 'rgba(2,136,209,0.15)', color: '#4fc3f7', fontWeight: 600, height: 22, fontSize: '0.6rem' }}
          />

          <Chip
            icon={<Database size={12} />}
            label={`${telemetry.totalTransactions} Tx`}
            size="small"
            sx={{ fontFamily: "'JetBrains Mono', monospace", bgcolor: 'rgba(255,143,0,0.15)', color: '#ff8f00', fontWeight: 600, height: 22, fontSize: '0.6rem' }}
          />

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title={isAdmin ? 'Switch to Consumer View' : 'Switch to Admin View'}>
            <Button
              size="small"
              variant="outlined"
              onClick={switchRole}
              startIcon={<ArrowLeftRight size={14} />}
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem',
                color: '#ffffff',
                borderColor: isAdmin ? 'rgba(255,143,0,0.5)' : 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: '#ffffff',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
                py: 0.3,
                px: 1,
                minHeight: 24,
              }}
            >
              {isAdmin ? 'Switch to Consumer' : 'Switch to Admin'}
            </Button>
          </Tooltip>

          <Tooltip title="Toggle Theme">
            <IconButton size="small" onClick={toggleTheme} sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </IconButton>
          </Tooltip>
        </Box>

        <AppBar position="static" elevation={0} sx={{ bgcolor: isDarkMode ? 'rgba(13,33,55,0.9)' : 'rgba(0,105,92,0.95)', backdropFilter: 'blur(8px)' }}>
          <Toolbar variant="dense" sx={{ minHeight: '52px !important', px: { xs: 1.5, md: 3 } }}>
            <Typography variant="h6" sx={{
              fontWeight: 700, letterSpacing: '-0.02em', flexGrow: 1,
              display: 'flex', alignItems: 'center', gap: 1,
              fontSize: { xs: '0.9rem', md: '1rem' },
            }}>
              {isAdmin ? <ShieldCheck size={20} /> : <PiggyBank size={20} />}
              {isAdmin ? 'Admin Terminal' : 'Consumer Dashboard'}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                icon={isAdmin ? <ShieldCheck size={14} /> : <Users size={14} />}
                label={isAdmin ? 'Admin Access' : 'Standard Consumer'}
                size="small"
                sx={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600, height: 24,
                  bgcolor: isAdmin ? 'rgba(255,143,0,0.2)' : 'rgba(0,105,92,0.2)',
                  color: isAdmin ? '#ff8f00' : '#ffffff',
                  border: isAdmin ? '1px solid rgba(255,143,0,0.3)' : '1px solid rgba(255,255,255,0.2)',
                }}
              />

              <Tooltip title="Notifications">
                <IconButton size="small" onClick={(e) => setNotifAnchor(e.currentTarget)} sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <Badge
                    badgeContent={userNotifs.filter((n) => !n.read).length}
                    color="error"
                    sx={{ '& .MuiBadge-badge': { fontSize: '0.55rem', height: 16, minWidth: 16 } }}
                  >
                    {userNotifs.some((n) => !n.read) ? <BellRing size={18} /> : <Bell size={18} />}
                  </Badge>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={notifAnchor}
                open={Boolean(notifAnchor)}
                onClose={() => setNotifAnchor(null)}
                PaperProps={{ sx: { width: 340, maxHeight: 420, mt: 1, borderRadius: 2 } }}
              >
                <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                    Notifications
                  </Typography>
                  {userNotifs.some((n) => !n.read) && (
                    <Chip
                      label="Mark all read"
                      size="small"
                      onClick={() => { if (currentUser) markAllNotificationsRead(currentUser.id); }}
                      sx={{ fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer' }}
                    />
                  )}
                </Box>
                <Divider />
                {userNotifs.length === 0 && (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No notifications yet.</Typography>
                  </Box>
                )}
                {userNotifs.slice(0, 20).map((n) => (
                  <MenuItem
                    key={n.id}
                    onClick={() => { if (!n.read) markNotificationRead(n.id); }}
                    sx={{
                      flexDirection: 'column', alignItems: 'flex-start', gap: 0.3, py: 1.5, px: 2,
                      bgcolor: !n.read ? (isDarkMode ? 'rgba(0,105,92,0.08)' : 'rgba(0,105,92,0.04)') : 'transparent',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      {!n.read && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00695c', flexShrink: 0 }} />}
                      <Typography variant="body2" sx={{ fontWeight: n.read ? 400 : 600, fontFamily: "'Inter', sans-serif", fontSize: '0.8rem' }}>
                        {n.title}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary', ml: 2.5, fontFamily: "'JetBrains Mono', monospace" }}>
                      {n.message}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>

              <Tooltip title="User Menu">
                <IconButton size="small" onClick={(e) => setUserMenuAnchor(e.currentTarget)} sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: isAdmin ? '#ff8f00' : '#00695c', fontSize: '0.7rem', fontWeight: 700 }}>
                    {currentUser?.name?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={() => setUserMenuAnchor(null)}
                PaperProps={{ sx: { mt: 1, borderRadius: 2, minWidth: 180 } }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                    {currentUser?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {currentUser?.email} — {activeRole}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={switchRole} sx={{ gap: 1 }}>
                  <ArrowLeftRight size={16} />
                  <Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    Switch to {isAdmin ? 'Consumer' : 'Admin'} View
                  </Typography>
                </MenuItem>
                <MenuItem onClick={() => { logout(); setUserMenuAnchor(null); }} sx={{ gap: 1 }}>
                  <LogOut size={16} />
                  <Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    Logout
                  </Typography>
                </MenuItem>
              </Menu>
            </Stack>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ flexGrow: 1, py: { xs: 2, md: 3 } }}>
          {isAdmin ? <AdminTerminal /> : <ConsumerDashboard />}
        </Container>

        <Box component="footer" sx={{
          py: 1.5, textAlign: 'center',
          borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)',
          bgcolor: isDarkMode ? '#0d2137' : '#00695c',
        }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'JetBrains Mono', monospace" }}>
            &copy; {new Date().getFullYear()} Ajo/Esusu Digital Cooperative &mdash; Built on
            Trust &amp; Transparency &middot; {isAdmin ? 'Admin Oversight' : 'Consumer Portal'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AppMainLayout;
