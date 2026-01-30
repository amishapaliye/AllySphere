import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, Star, Briefcase, Users, Heart, Calendar, Crown, Sparkles } from "lucide-react";

const LeaderboardPage = () => {
  const { data: contributions, isLoading: loadingContributions } = useQuery({
    queryKey: ["alumni-contributions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alumni_contributions")
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            department,
            graduation_year
          )
        `)
        .order("mentorships_completed", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: badges, isLoading: loadingBadges } = useQuery({
    queryKey: ["alumni-badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alumni_badges")
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order("awarded_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 1: return <Medal className="w-6 h-6 text-gray-400" />;
      case 2: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">{index + 1}</span>;
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0: return "bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-yellow-500/30";
      case 1: return "bg-gradient-to-r from-gray-400/10 to-gray-400/5 border-gray-400/30";
      case 2: return "bg-gradient-to-r from-amber-600/10 to-amber-600/5 border-amber-600/30";
      default: return "";
    }
  };

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case "mentor": return <Users className="w-4 h-4" />;
      case "referral": return <Briefcase className="w-4 h-4" />;
      case "donation": return <Heart className="w-4 h-4" />;
      case "event": return <Calendar className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "mentor": return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "referral": return "bg-primary/20 text-primary border-primary/30";
      case "donation": return "bg-pink-500/20 text-pink-600 border-pink-500/30";
      case "event": return "bg-purple-500/20 text-purple-600 border-purple-500/30";
      default: return "bg-gray-500/20 text-gray-600 border-gray-500/30";
    }
  };

  // Calculate total impact score for sorting
  const sortedContributions = contributions?.map(c => ({
    ...c,
    totalScore: (c.mentorships_completed * 10) + (c.referrals_made * 15) + (c.jobs_posted * 5) + (c.events_hosted * 8) + (Number(c.total_donations) / 100)
  })).sort((a, b) => b.totalScore - a.totalScore);

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">Hall of Fame</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Alumni Leaderboard
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Celebrating the alumni who give back the most to the ACET community
          </p>
        </div>

        <Tabs defaultValue="overall" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="mentors">Top Mentors</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
          </TabsList>

          {/* Overall Leaderboard */}
          <TabsContent value="overall">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Impact Leaderboard
                </CardTitle>
                <CardDescription>
                  Ranked by overall contribution to the ACET community
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingContributions ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                        <div className="w-10 h-10 bg-muted rounded-full" />
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                          <div className="h-3 bg-muted rounded w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : sortedContributions?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No contributions yet. Be the first!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sortedContributions?.map((contributor, index) => {
                      const profile = contributor.profiles as any;
                      return (
                        <div
                          key={contributor.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-muted/50 ${getRankBg(index)}`}
                        >
                          <div className="w-10 flex justify-center">
                            {getRankIcon(index)}
                          </div>
                          
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarImage src={profile?.avatar_url} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {profile?.full_name?.charAt(0) || "A"}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {profile?.full_name || "Anonymous Alumni"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {profile?.department} • Class of {profile?.graduation_year}
                            </p>
                          </div>
                          
                          <div className="hidden sm:flex items-center gap-4 text-sm">
                            <div className="text-center">
                              <p className="font-bold text-primary">{contributor.mentorships_completed}</p>
                              <p className="text-xs text-muted-foreground">Mentorships</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-primary">{contributor.referrals_made}</p>
                              <p className="text-xs text-muted-foreground">Referrals</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-primary">{contributor.jobs_posted}</p>
                              <p className="text-xs text-muted-foreground">Jobs</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              {Math.round(contributor.totalScore)}
                            </p>
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Mentors */}
          <TabsContent value="mentors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Top Mentors
                </CardTitle>
                <CardDescription>
                  Alumni who have guided the most students
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingContributions ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse h-20 bg-muted rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contributions
                      ?.filter(c => c.mentorships_completed > 0)
                      .sort((a, b) => b.mentorships_completed - a.mentorships_completed)
                      .slice(0, 9)
                      .map((mentor, index) => {
                        const profile = mentor.profiles as any;
                        return (
                          <Card key={mentor.id} className={`relative overflow-hidden ${index < 3 ? 'border-primary/30' : ''}`}>
                            {index < 3 && (
                              <div className="absolute top-2 right-2">
                                {getRankIcon(index)}
                              </div>
                            )}
                            <CardContent className="pt-6 text-center">
                              <Avatar className="h-16 w-16 mx-auto mb-3 border-2 border-primary/20">
                                <AvatarImage src={profile?.avatar_url} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                  {profile?.full_name?.charAt(0) || "A"}
                                </AvatarFallback>
                              </Avatar>
                              <h3 className="font-semibold truncate">{profile?.full_name}</h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {profile?.department}
                              </p>
                              <Badge className="bg-blue-500/20 text-blue-600">
                                {mentor.mentorships_completed} Mentorships
                              </Badge>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Achievement Badges
                </CardTitle>
                <CardDescription>
                  Recent badges earned by alumni
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingBadges ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse h-32 bg-muted rounded-lg" />
                    ))}
                  </div>
                ) : badges?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No badges awarded yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {badges?.map((badge) => {
                      const profile = badge.profiles as any;
                      return (
                        <Card key={badge.id} className="text-center p-4 hover:shadow-md transition-shadow">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${getBadgeColor(badge.badge_type)}`}>
                            {getBadgeIcon(badge.badge_type)}
                          </div>
                          <h4 className="font-semibold text-sm mb-1">{badge.badge_name}</h4>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {badge.description}
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={profile?.avatar_url} />
                              <AvatarFallback className="text-xs bg-primary/10">
                                {profile?.full_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground truncate">
                              {profile?.full_name}
                            </span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Badge Legend */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Badge Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { type: "mentor", name: "Mentor Champion", desc: "Completed 5+ mentorships" },
                    { type: "referral", name: "Top Referrer", desc: "Made 3+ successful referrals" },
                    { type: "donation", name: "Generous Donor", desc: "Donated ₹10,000+" },
                    { type: "event", name: "Event Host", desc: "Hosted 2+ events" },
                  ].map((badge) => (
                    <div key={badge.type} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`p-2 rounded-full ${getBadgeColor(badge.type)}`}>
                        {getBadgeIcon(badge.type)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default LeaderboardPage;
