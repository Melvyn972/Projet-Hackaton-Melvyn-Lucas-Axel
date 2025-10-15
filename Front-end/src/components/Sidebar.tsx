import { Home, User, Users, Settings, Shield, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../lib/api';

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
    { icon: Users, label: 'Amis', path: '/friends' },
    { icon: Settings, label: 'Paramètres', path: '/settings' },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ icon: Shield, label: 'Admin', path: '/admin' });
  }

  return (
    <div className="h-screen sticky top-0 w-64 border-r bg-card p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Social</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant={location.pathname === item.path ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="border-t pt-4">
        <div className="mb-3">
          <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
};

