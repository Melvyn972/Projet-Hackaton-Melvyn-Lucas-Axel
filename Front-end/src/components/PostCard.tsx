import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { Post } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => Promise<void>;
}

export const PostCard = ({ post, onLike, onComment }: PostCardProps) => {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

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
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
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
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full rounded-lg object-cover max-h-96"
          />
        )}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={post.isLikedByCurrentUser ? 'text-red-500' : ''}
              onClick={() => onLike(post.id)}
            >
              <Heart className={`h-5 w-5 mr-2 ${post.isLikedByCurrentUser ? 'fill-current' : ''}`} />
              {post._count.likes}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              {post._count.comments}
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <Share2 className="h-5 w-5 mr-2" />
            Partager
          </Button>
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
            <div className="text-sm text-muted-foreground text-center">
              {post._count.comments === 0 
                ? 'Aucun commentaire' 
                : `${post._count.comments} commentaire${post._count.comments > 1 ? 's' : ''}`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

