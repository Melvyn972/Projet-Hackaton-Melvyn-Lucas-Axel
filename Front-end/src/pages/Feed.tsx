import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { CreatePost } from '../components/CreatePost';
import { PostCard } from '../components/PostCard';
import type { Post } from '../lib/api';
import { postApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';

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
    await postApi.createPost(content, imageUrl);
    loadPosts(1);
    setPage(1);
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
    }
  };

  const handleComment = async (postId: string, content: string) => {
    try {
      await postApi.addComment(postId, content);
      
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
    </div>
  );
};

