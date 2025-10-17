import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Sidebar2 } from '@/components/Sidebar2';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import type { User } from '../lib/api';
import { userApi } from '../lib/api';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/input';
import { MoreVertical, Edit2, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

interface ProfileComment {
  id: string;
  content: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
}

export const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profileComments, setProfileComments] = useState<ProfileComment[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuthStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      const response = await userApi.getUserById(userId!);
      setUser(response.data.user);
      setProfileComments(response.data.profileComments || []);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    setLoading(true);
    try {
      await userApi.addProfileComment(userId!, comment);
      setComment('');
      // Recharger le profil pour afficher le nouveau commentaire
      loadUser();
      toast.success('Commentaire ajouté');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout du commentaire');
    } finally {
      setLoading(false);
    }
  };

  const canEdit = (c: ProfileComment) => currentUser?.id === c.author.id;
  const canDelete = (c: ProfileComment) => currentUser?.id === c.author.id || currentUser?.id === userId;

  const startEdit = (c: ProfileComment) => {
    setEditingId(c.id);
    setEditText(c.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async (c: ProfileComment) => {
    if (!canEdit(c) || saving) return;
    const newText = editText.trim();
    if (!newText) return;
    setSaving(true);
    try {
      const res = await userApi.updateProfileComment(c.id, newText);
      const updated = res.data.comment as ProfileComment;
      setProfileComments((prev) => prev.map((pc) => (pc.id === c.id ? { ...pc, content: updated.content } : pc)));
      cancelEdit();
      toast.success('Commentaire modifié');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  const deleteComment = async (c: ProfileComment) => {
    if (!canDelete(c)) return;
    if (!confirm('Supprimer ce commentaire ?')) return;
    setDeletingId(c.id);
    try {
      await userApi.deleteProfileComment(c.id);
      setProfileComments((prev) => prev.filter((pc) => pc.id !== c.id));
      toast.success('Commentaire supprimé');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const getInitials = () => {
    if (!user) return '?';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  if (!user) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 max-w-4xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-3xl">{getInitials()}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                {user.description && (
                  <div>
                    <h3 className="font-semibold mb-1">À propos</h3>
                    <p className="text-muted-foreground">{user.description}</p>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Membre depuis</p>
                  <p className="font-semibold">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Commentaires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Laisser un commentaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Écrivez un commentaire sur ce profil..."
                className="min-h-[100px]"
              />
              <Button
                className='cursor-pointer'
                onClick={handleAddComment}
                disabled={loading || !comment.trim()}
              >
                {loading ? 'Envoi...' : 'Publier le commentaire'}
              </Button>
            </div>

            {/* Liste des commentaires */}
            <div className="mt-6 pt-6 border-t space-y-4">
              <h3 className="font-semibold">Commentaires ({profileComments.length})</h3>
              {profileComments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun commentaire pour le moment
                </p>
              ) : (
                <div className="space-y-3">
                  {profileComments.map((c) => (
                    <div key={c.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={c.author.avatar} />
                        <AvatarFallback>
                          {c.author.firstName[0]}{c.author.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {c.author.firstName} {c.author.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          {(canEdit(c) || canDelete(c)) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="cursor-pointer">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {canEdit(c) && (
                                  <DropdownMenuItem onClick={() => startEdit(c)}>
                                    <Edit2 className="h-4 w-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                )}
                                {canDelete(c) && (
                                  <DropdownMenuItem variant="destructive" onClick={() => deleteComment(c)}>
                                    <Trash2 className="h-4 w-4" />
                                    Supprimer
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        {editingId === c.id ? (
                          <div className="mt-2 space-y-2">
                            <Textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="min-h-[80px]"
                            />
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" className="cursor-pointer" onClick={cancelEdit} disabled={saving}>
                                <X className="h-4 w-4 mr-2" />
                                Annuler
                              </Button>
                              <Button className="cursor-pointer" onClick={() => saveEdit(c)} disabled={saving}>
                                <Save className="h-4 w-4 mr-2" />
                                {saving ? 'Enregistrement…' : 'Enregistrer'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm mt-1">{c.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Sidebar2 />
    </div>
  );
};

