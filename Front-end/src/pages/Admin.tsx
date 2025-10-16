import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Sidebar2 } from '@/components/Sidebar2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { adminApi, postApi, type Post, type User } from '../lib/api';
import { Users, FileText, Heart, MessageCircle, Shield, Trash2, Search, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export const Admin = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'posts'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postSearch, setPostSearch] = useState('');

  useEffect(() => {
    loadStatsSection();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      void loadUsers();
    }
    if (activeTab === 'posts') {
      void loadPosts();
    }
  }, [activeTab, userPage]);

  const loadStatsSection = async () => {
    try {
      const [statsRes, timelineRes, topUsersRes, topPostsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getActivityTimeline(14),
        adminApi.getTopUsers(5),
        adminApi.getTopPosts(5),
      ]);
      setStats(statsRes.data);
      setTimeline(timelineRes.data?.timeline || []);
      setTopUsers(topUsersRes.data?.topUsers || []);
      setTopPosts(topPostsRes.data?.posts || []);
    } catch (error) {
      console.error('Error loading stats section:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const params: any = { page: userPage, limit: 10, sortBy: 'createdAt', order: 'desc' };
      if (userSearch) params.search = userSearch;
      if (userRoleFilter !== 'ALL') params.role = userRoleFilter;
      const res = await adminApi.getAllUsers(params);
      setUsers(res.data.users);
      setUserTotalPages(res.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const onChangeUserRole = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      await loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const onDeleteUser = async (userId: string) => {
    try {
      await adminApi.deleteUser(userId);
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      const res = await postApi.getPosts(1, 20);
      setPosts(res.data?.posts || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const onDeletePost = async (postId: string) => {
    try {
      await postApi.deletePost(postId);
      await loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
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
          
          {/* Tabs */}
          <div className="mb-6 flex gap-2">
            <Button className="cursor-pointer" variant={activeTab === 'stats' ? 'default' : 'outline'} onClick={() => setActiveTab('stats')}>Statistiques</Button>
            <Button className="cursor-pointer" variant={activeTab === 'users' ? 'default' : 'outline'} onClick={() => setActiveTab('users')}>Utilisateurs</Button>
            <Button className="cursor-pointer" variant={activeTab === 'posts' ? 'default' : 'outline'} onClick={() => setActiveTab('posts')}>Posts</Button>
          </div>
          
          {activeTab === 'stats' && (
            <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">+{stats?.overview.newUsersLastWeek} cette semaine</p>
                    <p className="text-xs mt-2">Nombre total de comptes. Variation hebdo pour mesurer l’acquisition.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Posts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview.totalPosts}</div>
                    <p className="text-xs text-muted-foreground">+{stats?.overview.newPostsLastWeek} cette semaine</p>
                    <p className="text-xs mt-2">Volume total de contenu publié et tendance court terme.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Likes</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview.totalLikes}</div>
                    <p className="text-xs text-muted-foreground">{stats?.averages.likesPerPost} par post</p>
                    <p className="text-xs mt-2">Indique l’attrait moyen des posts.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Commentaires</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.overview.totalComments}</div>
                    <p className="text-xs text-muted-foreground">{stats?.averages.commentsPerPost} par post</p>
                    <p className="text-xs mt-2">Mesure la conversation générée par post.</p>
              </CardContent>
            </Card>
          </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Activité (14 jours)</CardTitle>
                    <CardDescription>Nouveaux utilisateurs et posts par jour</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {timeline.map((d) => (
                        <div key={d.date} className="flex items-center justify-between text-sm">
                          <span className="w-28 text-muted-foreground">{d.date}</span>
                          <div className="flex-1 mx-3 h-2 bg-muted rounded overflow-hidden">
                            <div className="h-2 bg-primary/70" style={{ width: `${Math.min(100, d.newUsers * 5)}%` }} />
                          </div>
                          <span className="w-14 text-right">{d.newUsers} U</span>
                          <div className="flex-1 mx-3 h-2 bg-muted rounded overflow-hidden">
                            <div className="h-2 bg-secondary" style={{ width: `${Math.min(100, d.newPosts * 5)}%` }} />
                          </div>
                          <span className="w-14 text-right">{d.newPosts} P</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par genre</CardTitle>
                      <CardDescription>Comptes par genre</CardDescription>
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
                      <CardTitle>Métriques d’engagement</CardTitle>
                      <CardDescription>Explications rapides</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2 list-disc pl-5">
                        <li><b>Posts/Utilisateur</b>: productivité moyenne par compte.</li>
                        <li><b>Commentaires/Post</b>: conversation moyenne par contenu.</li>
                        <li><b>Likes/Post</b>: attractivité moyenne des contenus.</li>
                        <li><b>Taux d’engagement</b>: (likes + commentaires) / posts, en %.</li>
                      </ul>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between"><span>Posts/Utilisateur</span><span className="font-semibold">{stats?.averages.postsPerUser}</span></div>
                        <div className="flex justify-between"><span>Commentaires/Post</span><span className="font-semibold">{stats?.averages.commentsPerPost}</span></div>
                        <div className="flex justify-between"><span>Likes/Post</span><span className="font-semibold">{stats?.averages.likesPerPost}</span></div>
                        <div className="flex justify-between"><span>Taux d’engagement</span><span className="font-semibold">{stats?.averages.engagementRate}%</span></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top utilisateurs</CardTitle>
                    <CardDescription>Classés par score d’activité</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      {topUsers.map((u) => (
                        <div key={u.id} className="flex items-center justify-between">
                          <span>{u.firstName} {u.lastName}</span>
                          <span className="text-muted-foreground">Score: {u.activityScore}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Top posts</CardTitle>
                    <CardDescription>Plus likés/commentés</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      {topPosts.map((p) => (
                        <div key={p.id} className="flex items-center justify-between">
                          <span className="truncate max-w-[60%]">{p.content}</span>
                          <span className="text-muted-foreground">❤ {p._count.likes} · 💬 {p._count.comments}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
            <Card>
              <CardHeader>
                  <CardTitle>Gestion des utilisateurs</CardTitle>
                  <CardDescription>Rechercher, filtrer, changer le rôle, supprimer</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="flex gap-2 mb-4 items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Rechercher par nom ou email" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-8" />
                    </div>
                    <select className="cursor-pointer border rounded-md h-9 px-2" value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value as any)}>
                      <option value="ALL">Tous les rôles</option>
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    <Button className='cursor-pointer' variant="outline" onClick={() => { setUserPage(1); void loadUsers(); }}>Appliquer</Button>
                  </div>

                  <div className="divide-y">
                    {usersLoading ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">Chargement des utilisateurs…</div>
                    ) : users.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">Aucun utilisateur</div>
                    ) : (
                      users.map((u) => (
                        <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{u.firstName} {u.lastName}</div>
                            <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs px-2 py-1 rounded border">
                              <Shield className="h-3 w-3" />
                              {u.role}
                            </div>
                            <select className="cursor-pointer border rounded-md h-9 px-2" value={u.role} onChange={(e) => onChangeUserRole(u.id, e.target.value as 'USER' | 'ADMIN')}>
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                            <Button className='cursor-pointer' variant="destructive" size="icon" aria-label="Supprimer" onClick={() => onDeleteUser(u.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 text-sm">
                    <Button className="cursor-pointer" variant="outline" onClick={() => setUserPage((p) => Math.max(1, p - 1))} disabled={userPage === 1}>Précédent</Button>
                    <span>Page {userPage} / {userTotalPages}</span>
                    <Button className="cursor-pointer" variant="outline" onClick={() => setUserPage((p) => Math.min(userTotalPages, p + 1))} disabled={userPage >= userTotalPages}>Suivant</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Modération des posts</CardTitle>
                  <CardDescription>Supprimer les posts problématiques</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4 items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Filtrer par texte (client)" value={postSearch} onChange={(e) => setPostSearch(e.target.value)} className="pl-8" />
                    </div>
                    <Button className='cursor-pointer' variant="outline" onClick={() => void loadPosts()}>Rafraîchir</Button>
                  </div>
                  <div className="divide-y">
                    {postsLoading ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">Chargement des posts…</div>
                    ) : posts.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">Aucun post</div>
                    ) : (
                      posts
                        .filter((p) => !postSearch || p.content.toLowerCase().includes(postSearch.toLowerCase()))
                        .map((p) => (
                          <div key={p.id} className="py-3 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm text-muted-foreground">par {p.author.firstName} {p.author.lastName}</div>
                              <div className="font-medium truncate max-w-[60ch]">{p.content}</div>
                              <div className="text-xs text-muted-foreground">❤ {p._count.likes} · 💬 {p._count.comments}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button className='cursor-pointer' variant="destructive" size="icon" aria-label="Supprimer le post" onClick={() => onDeletePost(p.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
          )}
        </div>
      </div>
      <Sidebar2 />
    </div>
  );
};

