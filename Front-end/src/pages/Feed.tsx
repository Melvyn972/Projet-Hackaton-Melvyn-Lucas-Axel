import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Sidebar2 } from '@/components/Sidebar2';
import { CreatePost } from '../components/CreatePost';
import { PostCard } from '../components/PostCard';
import type { Post } from '../lib/api';
import { postApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = async (pageNum: number) => {
    try {
      const response = await postApi.getPosts(pageNum, 10);
      const newPosts = response.data.posts;
      
      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }
      
      setHasMore(newPosts.length === 10);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(1);
  }, []);

  const handleCreatePost = async (content: string, imageUrl?: string) => {
    try {
      await postApi.createPost(content, imageUrl);
      toast.success('Post créé');
      loadPosts(1);
      setPage(1);
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Erreur lors de la création du post';
      toast.error(msg);
      throw error;
    }
  };

  const handleLike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    try {
      if (post.isLikedByCurrentUser) {
        await postApi.unlikePost(postId);
      } else {
        await postApi.likePost(postId);
      }
      
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLikedByCurrentUser: !p.isLikedByCurrentUser,
                _count: {
                  ...p._count,
                  likes: p.isLikedByCurrentUser ? p._count.likes - 1 : p._count.likes + 1,
                },
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Erreur lors du like');
    }
  };

  const handleComment = async (postId: string, content: string) => {
    try {
      await postApi.addComment(postId, content);
      toast.success('Commentaire ajouté');
      
      // Mettre à jour le compteur de commentaires
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                _count: {
                  ...p._count,
                  comments: p._count.comments + 1,
                },
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Erreur lors de l'ajout du commentaire");
      throw error;
    }
  };

  const handleEdit = async (postId: string, content: string, imageUrl?: string) => {
    try {
      const response = await postApi.updatePost(postId, content, imageUrl);
      const updated = response.data.post as Post;
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...updated } : p)));
      toast.success('Post modifié');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Erreur lors de la modification du post');
      throw error;
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await postApi.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Post supprimé');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Erreur lors de la suppression du post');
      throw error;
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 max-w-2xl mx-auto p-4">
        <CreatePost onSubmit={handleCreatePost} />
        
        {loading && page === 1 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
            
            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button onClick={loadMore} variant="outline">
                  Voir plus
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <Sidebar2 />      
    </div>
  );
};

