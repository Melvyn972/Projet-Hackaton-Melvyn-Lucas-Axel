import { Heart, MessageCircle, Send, MoreVertical, Edit2, Trash2, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import type { Post, Comment } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { postApi } from '../lib/api';
import { toast } from 'sonner';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => Promise<void>;
  onEdit: (postId: string, content: string, imageUrl?: string) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
}

export const PostCard = ({ post, onLike, onComment, onEdit, onDelete }: PostCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editImageUrl, setEditImageUrl] = useState(post.imageUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [savingComment, setSavingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const handleProfileClick = () => {
    navigate(`/profile/${post.author.id}`);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || loading) return;

    setLoading(true);
    try {
      await onComment(post.id, commentText);
      setCommentText('');
      if (showComments) {
        await refreshComments();
      }
      toast.success('Commentaire ajouté');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Erreur lors de l'ajout du commentaire");
    } finally {
      setLoading(false);
    }
  };

  const isOwner = user?.id === post.author.id;

  const handleSaveEdit = async () => {
    if (!isOwner || isSaving) return;
    const newContent = editContent.trim();
    const newImage = editImageUrl.trim() || undefined;
    if (!newContent) return;
    setIsSaving(true);
    try {
      await onEdit(post.id, newContent, newImage);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner || isDeleting) return;
    if (!confirm('Supprimer ce post ? Cette action est irréversible.')) return;
    setIsDeleting(true);
    try {
      await onDelete(post.id);
      toast.success('Post supprimé');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Erreur lors de la suppression du post');
    } finally {
      setIsDeleting(false);
    }
  };

  const refreshComments = async () => {
    setLoadingComments(true);
    try {
      const res = await postApi.getPostById(post.id);
      const fetched: Comment[] = (res.data.post?.comments || []) as Comment[];
      setComments(fetched);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments === null && !loadingComments) {
      await refreshComments();
    }
  };

  const canEditComment = (c: Comment) => user?.id === c.author.id;
  const canDeleteComment = (c: Comment) => user?.id === c.author.id || user?.id === post.author.id;

  const startEditComment = (c: Comment) => {
    setEditingCommentId(c.id);
    setEditCommentText(c.content);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const saveComment = async (c: Comment) => {
    if (!canEditComment(c) || savingComment) return;
    const newText = editCommentText.trim();
    if (!newText) return;
    setSavingComment(true);
    try {
      const res = await postApi.updateComment(c.id, newText);
      const updated = res.data.comment as Comment;
      setComments((prev) => (prev ? prev.map((cm) => (cm.id === c.id ? { ...cm, content: updated.content } : cm)) : prev));
      cancelEditComment();
      toast.success('Commentaire modifié');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Erreur lors de la modification du commentaire';
      toast.error(msg);
    } finally {
      setSavingComment(false);
    }
  };

  const deleteComment = async (c: Comment) => {
    if (!canDeleteComment(c)) return;
    if (!confirm('Supprimer ce commentaire ?')) return;
    setDeletingCommentId(c.id);
    try {
      await postApi.deleteComment(c.id);
      setComments((prev) => (prev ? prev.filter((cm) => cm.id !== c.id) : prev));
      toast.success('Commentaire supprimé');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Erreur lors de la suppression du commentaire';
      toast.error(msg);
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <Card className="">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar 
              className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={handleProfileClick}
            >
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>{getInitials(post.author.firstName, post.author.lastName)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 
                className="font-semibold cursor-pointer hover:text-primary transition-colors"
                onClick={handleProfileClick}
              >
                {post.author.firstName} {post.author.lastName}
              </h4>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}
              </p>
            </div>
          </div>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <>
            <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="Post"
                className="w-full rounded-lg object-cover max-h-96"
              />
            )}
          </>
        ) : (
          <div className="space-y-2 mb-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <Input
              type="url"
              placeholder="URL de l'image"
              value={editImageUrl}
              onChange={(e) => setEditImageUrl(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(post.content);
                  setEditImageUrl(post.imageUrl || '');
                }}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button className="cursor-pointer" onClick={handleSaveEdit} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between pt-4">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={post.isLikedByCurrentUser ? 'text-red-500 cursor-pointer' : 'cursor-pointer'}
              onClick={() => onLike(post.id)}
            >
              <Heart className={`h-5 w-5 mr-2 ${post.isLikedByCurrentUser ? 'fill-current' : ''}`} />
              {post._count.likes}
            </Button>
            <Button className="cursor-pointer" variant="ghost" size="sm" onClick={toggleComments}>
              <MessageCircle className="h-5 w-5 mr-2" />
              {post._count.comments}
            </Button>
          </div>
        </div>

        {/* Section Commentaires */}
        {showComments && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <form onSubmit={handleAddComment} className="flex gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ajouter un commentaire..."
                disabled={loading}
              />
              <Button type="submit" size="icon" disabled={loading || !commentText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
            {loadingComments ? (
              <div className="text-sm text-muted-foreground text-center">Chargement…</div>
            ) : !comments || comments.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center">
                Aucun commentaire
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={c.author.avatar} />
                      <AvatarFallback>
                        {c.author.firstName[0]}
                        {c.author.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold">
                            {c.author.firstName} {c.author.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: fr })}
                          </span>
                        </div>
                        {(canEditComment(c) || canDeleteComment(c)) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="cursor-pointer">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canEditComment(c) && (
                                <DropdownMenuItem onClick={() => startEditComment(c)}>
                                  <Edit2 className="h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                              )}
                              {canDeleteComment(c) && (
                                <DropdownMenuItem variant="destructive" onClick={() => deleteComment(c)}>
                                  <Trash2 className="h-4 w-4" />
                                  {deletingCommentId === c.id ? 'Suppression…' : 'Supprimer'}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      {editingCommentId === c.id ? (
                        <div className="mt-2 space-y-2">
                          <Textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            className="min-h-[60px]"
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" className="cursor-pointer" onClick={cancelEditComment} disabled={savingComment}>
                              <X className="h-4 w-4 mr-2" />
                              Annuler
                            </Button>
                            <Button className="cursor-pointer" onClick={() => saveComment(c)} disabled={savingComment}>
                              <Save className="h-4 w-4 mr-2" />
                              {savingComment ? 'Enregistrement…' : 'Enregistrer'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm mt-1 whitespace-pre-wrap">{c.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

