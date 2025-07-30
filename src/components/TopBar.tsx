import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
  ListItemIcon,
} from '@mui/material';
import { Settings, Logout } from '@mui/icons-material';
import { Bell, Search, User as UserIcon } from 'lucide-react'; // ✅ Import UserIcon dari lucide-react
import { Input } from '@/components/ui/input';
import { supabase } from '../supabaseClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

// ✅ Tambahkan tipe props
type TopBarProps = {
  onMenuClick: () => void;
};

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const profileOpen = Boolean(anchorEl);

  const handleOpenProfile = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseProfile = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleCloseProfile();
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (authLoading) {
    return (
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-end h-16">
        <p className="text-sm text-gray-500">Memuat informasi pengguna...</p>
      </header>
    );
  }

  if (!user) {
    return (
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-end h-16">
        <Button onClick={() => navigate('/login')} className="rounded-md">
          Login
        </Button>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        
        {/* ✅ Gunakan prop onMenuClick */}
        <Button
          variant="ghost"
          className="md:hidden mr-2"
          onClick={onMenuClick}
        >
          <svg
            className="w-6 h-6 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </Button>

        <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Cari pelanggaran, siswa..."
              className="pl-10 bg-slate-50 border-slate-200 rounded-md"
            />
          </div>
        <div className="flex items-center space-x-4">
          
          <Button variant="ghost" size="sm" className="relative rounded-md">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs" />
          </Button>

          <Tooltip title="Pengaturan Akun">
            <span style={{ display: 'inline-block' }}>
              <IconButton
                onClick={handleOpenProfile}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={profileOpen ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={profileOpen ? 'true' : undefined}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                    alt={user.email || 'User'}
                  />
                  <AvatarFallback>
                    {user.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </IconButton>
            </span>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={profileOpen}
            onClose={handleCloseProfile}
            onClick={handleCloseProfile}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleCloseProfile}>
              <Avatar className="w-6 h-6 mr-2">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                  alt={user.email || 'User'}
                />
                <AvatarFallback>
                  {user.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="font-medium text-sm">{user.email}</span>
                {role && (
                  <span className="text-xs text-blue-600">
                    {role.toUpperCase()}
                  </span>
                )}
              </div>
            </MenuItem>
            <Divider />
            <Link
              to="/dashboard/profile"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <MenuItem>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
            </Link>

            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
