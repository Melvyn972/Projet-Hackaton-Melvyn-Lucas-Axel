import { User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Avatar, AvatarImage } from './ui/avatar';


export const Sidebar2 = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await authApi.signout();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="h-screen sticky top-0 w-2/12 border-r bg-card p-4 flex flex-col">
      <div className="">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className='h-fit w-full cursor-pointer'>
              <div className="flex items-center gap-3 w-full min-w-0">
                <Avatar>
                  <AvatarImage src={user?.avatar} />
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <p className="font-semibold truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <Button
              key={'/profile'}
              className="w-full justify-start cursor-pointer"
              variant="ghost"
              onClick={() => navigate('/profile')}
            >
              <User className="h-4 w-4" />
              Profil
            </Button>
            <DropdownMenuSeparator />
            <Button variant="ghost" className="w-full justify-start cursor-pointer" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

