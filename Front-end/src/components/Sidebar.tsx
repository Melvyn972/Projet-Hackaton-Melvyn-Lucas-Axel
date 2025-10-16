import { Home, User, Shield, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../lib/api';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Avatar, AvatarImage } from './ui/avatar';


export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await authApi.signout();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { icon: Home, label: 'Accueil', path: '/' },
    { icon: User, label: 'Profil', path: '/profile' },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ icon: Shield, label: 'Admin', path: '/admin' });
  }

  return (
    <div className="h-screen sticky top-0 w-2/12 border-r bg-card p-4 flex flex-col">
      <div className="mb-8">
        <a href="/"><h1 className="text-2xl font-bold text-primary">Twittor.onion</h1></a>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant={location.pathname === item.path ? 'default' : 'ghost'}
            className="w-full justify-start cursor-pointer"
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </Button>
        ))}
      </nav>
    </div>
  );
};

