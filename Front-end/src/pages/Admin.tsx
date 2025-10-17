import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Sidebar2 } from '@/components/Sidebar2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { adminApi, postApi, type Post, type User } from '../lib/api';
import { Users, FileText, Heart, MessageCircle, Shield, Trash2, Search, TrendingUp, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';

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
  const [expandedUserIds, setExpandedUserIds] = useState<Record<string, boolean>>({});
  const [postsLoading, setPostsLoading] = useState(false);
  const [postSearch, setPostSearch] = useState('');

  const formatGender = (g?: string | null) => {
    if (!g || g === 'Non renseigné') return 'Non renseigné';
    switch (g) {
      case 'MALE':
        return 'Homme';
      case 'FEMALE':
        return 'Femme';
      case 'OTHER':
        return 'Autre';
      case 'PREFER_NOT_TO_SAY':
        return 'Préférer ne pas dire';
      default:
        return 'Non renseigné';
    }
  };

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
    return <div className="flex min-h-screen items-center justify-center">Chargement…</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Tableau de bord Admin</h1>
          
          {/* Tabs */}
          <div className="mb-6 flex gap-2">
            <Button className="cursor-pointer" variant={activeTab === 'stats' ? 'default' : 'outline'} onClick={() => setActiveTab('stats')}>Statistiques</Button>
            <Button className="cursor-pointer" variant={activeTab === 'users' ? 'default' : 'outline'} onClick={() => setActiveTab('users')}>Utilisateurs</Button>
            <Button className="cursor-pointer" variant={activeTab === 'posts' ? 'default' : 'outline'} onClick={() => setActiveTab('posts')}>Publications</Button>
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
                <CardTitle className="text-sm font-medium">Publications</CardTitle>
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
                    <CardDescription>Nouveaux utilisateurs et publications par jour</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      className="w-full"
                      config={{
                        newUsers: {
                          label: 'Nouveaux utilisateurs',
                          color: 'var(--chart-1)',
                        },
                        newPosts: {
                          label: 'Nouvelles publications',
                          color: 'var(--chart-2)',
                        },
                      }}
                    >
                      <AreaChart data={timeline} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={24} />
                        <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={30} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="newUsers" stroke="var(--color-newUsers)" fill="var(--color-newUsers)" fillOpacity={0.35} />
                        <Area type="monotone" dataKey="newPosts" stroke="var(--color-newPosts)" fill="var(--color-newPosts)" fillOpacity={0.35} />
                        <ChartLegend content={<ChartLegendContent />} />
                      </AreaChart>
                    </ChartContainer>
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
                      <span className="text-sm">{formatGender(item.gender)}</span>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Métriques d’engagement</CardTitle>
                      <CardDescription>Survolez pour les définitions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm cursor-help">Posts/Utilisateur</span>
                            </TooltipTrigger>
                            <TooltipContent>Nombre moyen de posts publiés par utilisateur.</TooltipContent>
                          </Tooltip>
                          <span className="font-semibold">{stats?.averages.postsPerUser}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm cursor-help">Commentaires/Post</span>
                            </TooltipTrigger>
                            <TooltipContent>Nombre moyen de commentaires par post.</TooltipContent>
                          </Tooltip>
                          <span className="font-semibold">{stats?.averages.commentsPerPost}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm cursor-help">Likes/Post</span>
                            </TooltipTrigger>
                            <TooltipContent>Nombre moyen de likes par post.</TooltipContent>
                          </Tooltip>
                          <span className="font-semibold">{stats?.averages.likesPerPost}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm cursor-help">Taux d’engagement</span>
                            </TooltipTrigger>
                            <TooltipContent>(likes + commentaires) / posts, en pourcentage.</TooltipContent>
                          </Tooltip>
                          <span className="font-semibold">{stats?.averages.engagementRate}%</span>
                        </div>
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
                    <CardTitle>Top publications</CardTitle>
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
                      users.map((u: any) => (
                        <div key={u.id} className="py-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-medium truncate">{u.firstName} {u.lastName}</div>
                              <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                              <div className="text-xs text-muted-foreground">{u._count?.addresses || 0} adresse{(u._count?.addresses || 0) > 1 ? 's' : ''}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="cursor-pointer"
                                onClick={() => setExpandedUserIds((prev) => ({ ...prev, [u.id]: !prev[u.id] }))}
                              >
                                <MapPin className="h-4 w-4 mr-2" />
                                Adresses
                                {expandedUserIds[u.id] ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                              </Button>
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
                          {expandedUserIds[u.id] && (
                            <div className="mt-3 rounded-md border bg-muted/40 p-3">
                              {u.addresses && u.addresses.length > 0 ? (
                                <div className="space-y-2 text-sm">
                                  {u.addresses.map((a: any) => (
                                    <div key={a.id} className="flex items-start justify-between">
                                      <div>
                                        <div className="font-medium">
                                          {a.street}, {a.postalCode} {a.city}
                                        </div>
                                        <div className="text-muted-foreground">{a.country}</div>
                                      </div>
                                      {a.isPrimary && (
                                        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">Principale</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground">Aucune adresse</div>
                              )}
                            </div>
                          )}
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
                  <CardTitle>Modération des publications</CardTitle>
                  <CardDescription>Supprimer les publications problématiques</CardDescription>
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

