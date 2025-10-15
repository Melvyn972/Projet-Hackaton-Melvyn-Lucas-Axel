import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Image, Send } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface CreatePostProps {
  onSubmit: (content: string, imageUrl?: string) => Promise<void>;
}

export const CreatePost = ({ onSubmit }: CreatePostProps) => {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(content, imageUrl || undefined);
      setContent('');
      setImageUrl('');
      setShowImageInput(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = () => {
    if (!user) return '?';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Quoi de neuf ?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            {showImageInput && (
              <Input
                type="url"
                placeholder="URL de l'image"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mt-2"
              />
            )}
            <div className="flex items-center justify-between mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageInput(!showImageInput)}
              >
                <Image className="h-5 w-5 mr-2" />
                Photo
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
              >
                <Send className="h-4 w-4 mr-2" />
                Publier
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

