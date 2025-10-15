import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { adminApi } from '../lib/api.ts';
import { Users, FileText, Heart, MessageCircle } from 'lucide-react';

export const Admin = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Dashboard Admin</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.overview.newUsersLastWeek} cette semaine
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Posts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview.totalPosts}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.overview.newPostsLastWeek} cette semaine
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Likes</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview.totalLikes}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.averages.likesPerPost} par post
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Commentaires</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview.totalComments}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.averages.commentsPerPost} par post
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par genre</CardTitle>
                <CardDescription>Statistiques des utilisateurs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.genderDistribution.map((item: any) => (
                    <div key={item.gender} className="flex justify-between items-center">
                      <span className="text-sm">{item.gender}</span>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Moyennes</CardTitle>
                <CardDescription>Statistiques d'engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Posts par utilisateur</span>
                    <span className="font-semibold">{stats?.averages.postsPerUser}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Commentaires par post</span>
                    <span className="font-semibold">{stats?.averages.commentsPerPost}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Likes par post</span>
                    <span className="font-semibold">{stats?.averages.likesPerPost}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taux d'engagement</span>
                    <span className="font-semibold">{stats?.averages.engagementRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

