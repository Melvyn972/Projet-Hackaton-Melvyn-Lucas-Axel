import { Heart, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import type { Post } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
}

export const PostCard = ({ post, onLike, onComment }: PostCardProps) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <Card className="">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>{getInitials(post.author.firstName, post.author.lastName)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">{post.author.firstName} {post.author.lastName}</h4>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}
              </p>
            </div>
          </div>
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
            <Button className="cursor-pointer" variant="ghost" size="sm" onClick={() => onComment(post.id)}>
              <MessageCircle className="h-5 w-5 mr-2" />
              {post._count.comments}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

