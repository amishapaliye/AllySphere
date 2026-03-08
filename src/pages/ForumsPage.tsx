import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus, Users, MessageSquare, Clock } from 'lucide-react';

interface Forum {
  id: string;
  alumni_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface AcceptedMentee {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  department: string | null;
}

const ForumsPage: React.FC = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [forums, setForums] = useState<Forum[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [postCounts, setPostCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [acceptedMentees, setAcceptedMentees] = useState<AcceptedMentee[]>([]);
  const [selectedMentees, setSelectedMentees] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) fetchForums();
  }, [user]);

  const fetchForums = async () => {
    try {
      // Get forums where user is a member or owner
      const { data: memberForumIds } = await supabase
        .from('forum_members')
        .select('forum_id')
        .eq('user_id', user!.id);

      const forumIds = memberForumIds?.map(m => m.forum_id) || [];

      // Also get forums where user is the alumni owner
      const { data: ownedForums } = await supabase
        .from('mentorship_forums')
        .select('*')
        .eq('alumni_id', user!.id);

      const { data: memberForums } = forumIds.length > 0
        ? await supabase.from('mentorship_forums').select('*').in('id', forumIds)
        : { data: [] };

      const allForums = [...(ownedForums || []), ...(memberForums || [])];
      const unique = Array.from(new Map(allForums.map(f => [f.id, f])).values());
      unique.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      setForums(unique as Forum[]);

      // Fetch counts
      const counts: Record<string, number> = {};
      const pCounts: Record<string, number> = {};
      for (const f of unique) {
        const { count: mc } = await supabase.from('forum_members').select('*', { count: 'exact', head: true }).eq('forum_id', f.id);
        counts[f.id] = mc || 0;
        const { count: pc } = await supabase.from('forum_posts').select('*', { count: 'exact', head: true }).eq('forum_id', f.id);
        pCounts[f.id] = pc || 0;
      }
      setMemberCounts(counts);
      setPostCounts(pCounts);
    } catch (err) {
      console.error('Error fetching forums:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcceptedMentees = async () => {
    if (!user) return;
    const { data: requests } = await supabase
      .from('mentorship_requests')
      .select('student_id')
      .eq('alumni_id', user.id)
      .eq('status', 'accepted');

    if (!requests || requests.length === 0) {
      setAcceptedMentees([]);
      return;
    }

    const studentIds = requests.map(r => r.student_id);
    const { data: profiles } = await supabase
      .from('profiles_public')
      .select('user_id, full_name, avatar_url, department')
      .in('user_id', studentIds);

    setAcceptedMentees((profiles || []) as AcceptedMentee[]);
  };

  const handleOpenCreate = () => {
    fetchAcceptedMentees();
    setTitle('');
    setDescription('');
    setSelectedMentees([]);
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!title.trim() || !user) return;
    setCreating(true);
    try {
      const { data: forum, error } = await supabase
        .from('mentorship_forums')
        .insert({ alumni_id: user.id, title: title.trim(), description: description.trim() || null })
        .select()
        .single();

      if (error) throw error;

      // Add alumni as admin member
      await supabase.from('forum_members').insert({ forum_id: forum.id, user_id: user.id, role: 'admin' });

      // Add selected mentees
      if (selectedMentees.length > 0) {
        await supabase.from('forum_members').insert(
          selectedMentees.map(uid => ({ forum_id: forum.id, user_id: uid, role: 'member' }))
        );
      }

      toast({ title: 'Forum created!', description: `${selectedMentees.length} mentees invited.` });
      setCreateOpen(false);
      fetchForums();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const toggleMentee = (uid: string) => {
    setSelectedMentees(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const isAlumni = userRole === 'alumni' || userRole === 'admin';

  if (loading) {
    return (
      <Layout>
        <div className="container py-8 space-y-4">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Mentorship Forums</h1>
            <p className="mt-1 text-muted-foreground">
              {isAlumni ? 'Create forums and guide your mentees collectively.' : 'Engage with your mentors and peers.'}
            </p>
          </div>
          {isAlumni && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Forum
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Mentorship Forum</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Forum Title</label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Career Guidance 2026" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this forum about?" className="mt-1" rows={3} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Invite Accepted Mentees</label>
                    {acceptedMentees.length === 0 ? (
                      <p className="mt-2 text-sm text-muted-foreground">No accepted mentees yet. Accept mentorship requests first.</p>
                    ) : (
                      <div className="mt-2 max-h-48 overflow-y-auto space-y-2 rounded-md border border-border p-2">
                        {acceptedMentees.map(m => (
                          <label key={m.user_id} className="flex items-center gap-3 rounded-md p-2 hover:bg-muted cursor-pointer">
                            <Checkbox checked={selectedMentees.includes(m.user_id)} onCheckedChange={() => toggleMentee(m.user_id)} />
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={m.avatar_url || undefined} />
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(m.full_name || '?')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground">{m.full_name}</p>
                              {m.department && <p className="text-xs text-muted-foreground">{m.department}</p>}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button onClick={handleCreate} disabled={!title.trim() || creating} className="w-full">
                    {creating ? 'Creating...' : 'Create Forum'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {forums.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">No forums yet</h3>
              <p className="mt-1 text-muted-foreground">
                {isAlumni ? 'Create a forum to start guiding your mentees collectively.' : 'Your mentors haven\'t created any forums yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forums.map(forum => (
              <Card
                key={forum.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => navigate(`/forums/${forum.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{forum.title}</CardTitle>
                    {forum.alumni_id === user?.id && (
                      <Badge variant="outline" className="text-xs">Owner</Badge>
                    )}
                  </div>
                  {forum.description && (
                    <CardDescription className="line-clamp-2">{forum.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {memberCounts[forum.id] || 0} members
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {postCounts[forum.id] || 0} posts
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(forum.updated_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ForumsPage;
