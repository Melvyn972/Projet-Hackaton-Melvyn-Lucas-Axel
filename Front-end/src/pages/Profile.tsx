import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { userApi, User } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Edit2, Save, X } from 'lucide-react';

export const Profile = () => {
  const { user: currentUser, setUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    description: '',
    avatar: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userApi.getProfile();
      setProfile(response.data.user);
      setFormData({
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName,
        description: response.data.user.description || '',
        avatar: response.data.user.avatar || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await userApi.updateProfile(formData);
      setProfile(response.data.user);
      setUser(response.data.user);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getInitials = () => {
    if (!profile) return '?';
    return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mon Profil</CardTitle>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile?.avatar || formData.avatar} />
                <AvatarFallback className="text-3xl">{getInitials()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Prénom</label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Nom</label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">URL Avatar</label>
                      <Input
                        value={formData.avatar}
                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Parlez-nous de vous..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {profile?.firstName} {profile?.lastName}
                      </h2>
                      <p className="text-muted-foreground">{profile?.email}</p>
                    </div>
                    {profile?.description && (
                      <div>
                        <h3 className="font-semibold mb-1">À propos</h3>
                        <p className="text-muted-foreground">{profile.description}</p>
                      </div>
                    )}
                    <div className="flex gap-6 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Membre depuis</p>
                        <p className="font-semibold">
                          {new Date(profile?.createdAt || '').toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rôle</p>
                        <p className="font-semibold">{profile?.role}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

