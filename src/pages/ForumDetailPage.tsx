import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Plus,
  MessageSquare,
  Briefcase,
  BookOpen,
  Lightbulb,
  Share2,
  Send,
  Users,
  Trash2,
} from 'lucide-react';

interface ForumPost {
  id: string;
  forum_id: string;
  author_id: string;
  title: string;
  content: string;
  post_type: string;
  created_at: string;
}

interface ForumComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

interface ProfileInfo {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
}

interface ForumMember {
  user_id: string;
  role: string;
  profile?: ProfileInfo;
}

const POST_TYPES = [
  { value: 'discussion', label: 'Discussion', icon: MessageSquare },
  { value: 'opportunity', label: 'Opportunity', icon: Briefcase },
  { value: 'guidance', label: 'Guidance', icon: BookOpen },
  { value: 'resource', label: 'Resource', icon: Share2 },
  { value: 'job', label: 'Job Opening', icon: Lightbulb },
];

const ForumDetailPage: React.FC = () => {
  const { forumId } = useParams<{ forumId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [forum, setForum] = useState<any>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [comments, setComments] = useState<Record<string, ForumComment[]>>({});
  const [members, setMembers] = useState<ForumMember[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileInfo>>({});
  const [loading, setLoading] = useState(true);

  // Create post state
  const [createOpen, setCreateOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('discussion');
  const [submitting, setSubmitting] = useState(false);

  // Comment state
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  useEffect(() => {
    if (user && forumId) fetchAll();
  }, [user, forumId]);

  const fetchAll = async () => {
    try {
      const { data: forumData, error: fErr } = await supabase
        .from('mentorship_forums')
        .select('*')
        .eq('id', forumId!)
        .single();

      if (fErr) throw fErr;
      setForum(forumData);

      const { data: membersData } = await supabase
        .from('forum_members')
        .select('user_id, role')
        .eq('forum_id', forumId!);

      const memberList = (membersData || []) as ForumMember[];
      setMembers(memberList);

      // Fetch all profiles
      const userIds = memberList.map(m => m.user_id);
      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles_public')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);

        const profileMap: Record<string, ProfileInfo> = {};
        (profs || []).forEach(p => { profileMap[p.user_id!] = p as ProfileInfo; });
        setProfiles(profileMap);
      }

      // Fetch posts
      const { data: postsData } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('forum_id', forumId!)
        .order('created_at', { ascending: false });

      const postsList = (postsData || []) as ForumPost[];
      setPosts(postsList);

      // Fetch all comments for these posts + their author profiles
      if (postsList.length > 0) {
        const postIds = postsList.map(p => p.id);
        const { data: commentsData } = await supabase
          .from('forum_comments')
          .select('*')
          .in('post_id', postIds)
          .order('created_at', { ascending: true });

        const grouped: Record<string, ForumComment[]> = {};
        const commentAuthorIds: string[] = [];
        (commentsData || []).forEach((c: any) => {
          if (!grouped[c.post_id]) grouped[c.post_id] = [];
          grouped[c.post_id].push(c);
          if (!userIds.includes(c.author_id)) commentAuthorIds.push(c.author_id);
        });
        setComments(grouped);

        // Also fetch post author profiles not in members
        const postAuthorIds = postsList.map(p => p.author_id).filter(id => !userIds.includes(id));
        const allExtraIds = [...new Set([...commentAuthorIds, ...postAuthorIds])];
        if (allExtraIds.length > 0) {
          const { data: extraProfs } = await supabase
            .from('profiles_public')
            .select('user_id, full_name, avatar_url')
            .in('user_id', allExtraIds);

          setProfiles(prev => {
            const next = { ...prev };
            (extraProfs || []).forEach(p => { next[p.user_id!] = p as ProfileInfo; });
            return next;
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error loading forum', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postTitle.trim() || !postContent.trim() || !user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('forum_posts').insert({
        forum_id: forumId!,
        author_id: user.id,
        title: postTitle.trim(),
        content: postContent.trim(),
        post_type: postType,
      });
      if (error) throw error;
      toast({ title: 'Post created!' });
      setCreateOpen(false);
      setPostTitle('');
      setPostContent('');
      setPostType('discussion');
      fetchAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleComment = async (postId: string) => {
    const text = commentTexts[postId]?.trim();
    if (!text || !user) return;
    try {
      const { error } = await supabase.from('forum_comments').insert({
        post_id: postId,
        author_id: user.id,
        content: text,
      });
      if (error) throw error;
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      fetchAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await supabase.from('forum_posts').delete().eq('id', postId);
      toast({ title: 'Post deleted' });
      fetchAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getPostTypeInfo = (type: string) => POST_TYPES.find(t => t.value === type) || POST_TYPES[0];

  const isOwner = forum?.alumni_id === user?.id;

  if (loading) {
    return (
      <Layout>
        <div className="container py-8 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </Layout>
    );
  }

  if (!forum) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h2 className="text-xl font-bold text-foreground">Forum not found</h2>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/forums')}>
            Back to Forums
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/forums')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Forums
          </Button>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{forum.title}</h1>
              {forum.description && <p className="mt-1 text-muted-foreground">{forum.description}</p>}
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-4 w-4" />{members.length} members</span>
                <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" />{posts.length} posts</span>
              </div>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> New Post</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Create Post</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Post Type</label>
                    <Select value={postType} onValueChange={setPostType}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {POST_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Title</label>
                    <Input value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder="Post title" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Content</label>
                    <Textarea value={postContent} onChange={e => setPostContent(e.target.value)} placeholder="Share your thoughts..." className="mt-1" rows={5} />
                  </div>
                  <Button onClick={handleCreatePost} disabled={!postTitle.trim() || !postContent.trim() || submitting} className="w-full">
                    {submitting ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Posts Feed */}
          <div className="space-y-4 lg:col-span-3">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">No posts yet. Be the first to start a discussion!</p>
                </CardContent>
              </Card>
            ) : (
              posts.map(post => {
                const typeInfo = getPostTypeInfo(post.post_type);
                const TypeIcon = typeInfo.icon;
                const author = profiles[post.author_id];
                const postComments = comments[post.id] || [];
                const isExpanded = expandedPost === post.id;

                return (
                  <Card key={post.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={author?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {author ? getInitials(author.full_name) : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{author?.full_name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <TypeIcon className="h-3 w-3" />
                            {typeInfo.label}
                          </Badge>
                          {post.author_id === user?.id && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeletePost(post.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-2">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{post.content}</p>

                      <Separator className="my-4" />

                      {/* Comments section */}
                      <div>
                        <button
                          onClick={() => setExpandedPost(isExpanded ? null : post.id)}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <MessageSquare className="h-4 w-4" />
                          {postComments.length} {postComments.length === 1 ? 'comment' : 'comments'}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 space-y-3">
                            {postComments.map(c => {
                              const cAuthor = profiles[c.author_id];
                              return (
                                <div key={c.id} className="flex gap-3 rounded-md bg-muted/50 p-3">
                                  <Avatar className="h-7 w-7">
                                    <AvatarImage src={cAuthor?.avatar_url || undefined} />
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                      {cAuthor ? getInitials(cAuthor.full_name) : '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-foreground">{cAuthor?.full_name || 'Unknown'}</span>
                                      <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-foreground mt-1">{c.content}</p>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Add comment */}
                            <div className="flex gap-2">
                              <Input
                                value={commentTexts[post.id] || ''}
                                onChange={e => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                placeholder="Write a comment..."
                                className="flex-1"
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(post.id); } }}
                              />
                              <Button size="icon" onClick={() => handleComment(post.id)} disabled={!commentTexts[post.id]?.trim()}>
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Members Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Members ({members.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {members.map(m => {
                  const prof = profiles[m.user_id];
                  return (
                    <div key={m.user_id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={prof?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {prof ? getInitials(prof.full_name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{prof?.full_name || 'Unknown'}</p>
                      </div>
                      {m.role === 'admin' && <Badge variant="outline" className="text-xs">Mentor</Badge>}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForumDetailPage;
