import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Briefcase, MapPin, Clock, Building2, Plus, ExternalLink, Search, Filter } from "lucide-react";
import { format } from "date-fns";

const JobsPage = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    job_type: "full-time",
    description: "",
    requirements: "",
    salary_range: "",
    apply_url: "",
    is_referral: false,
  });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: userRole } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data?.role;
    },
    enabled: !!user?.id,
  });

  const createJobMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase.from("jobs").insert({
        ...newJob,
        posted_by: user.id,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setIsCreateOpen(false);
      setNewJob({
        title: "",
        company: "",
        location: "",
        job_type: "full-time",
        description: "",
        requirements: "",
        salary_range: "",
        apply_url: "",
        is_referral: false,
      });
      toast({ title: "Job posted successfully!" });
    },
    onError: (error) => {
      toast({ title: "Error posting job", description: error.message, variant: "destructive" });
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase.from("job_applications").insert({
        job_id: jobId,
        applicant_id: user.id,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Application submitted!" });
    },
    onError: (error) => {
      toast({ title: "Error applying", description: error.message, variant: "destructive" });
    },
  });

  const canPostJobs = userRole === "alumni" || userRole === "admin";

  const filteredJobs = jobs?.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || job.job_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Job Board</h1>
            <p className="text-muted-foreground mt-1">
              Exclusive opportunities from ACET alumni network
            </p>
          </div>
          
          {canPostJobs && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Post a Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Post a New Job</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Job Title *</Label>
                      <Input
                        placeholder="e.g. Software Engineer"
                        value={newJob.title}
                        onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company *</Label>
                      <Input
                        placeholder="e.g. Google"
                        value={newJob.company}
                        onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        placeholder="e.g. Bangalore, India"
                        value={newJob.location}
                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Job Type</Label>
                      <Select
                        value={newJob.job_type}
                        onValueChange={(value) => setNewJob({ ...newJob, job_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full Time</SelectItem>
                          <SelectItem value="part-time">Part Time</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Salary Range</Label>
                    <Input
                      placeholder="e.g. ₹10-15 LPA"
                      value={newJob.salary_range}
                      onChange={(e) => setNewJob({ ...newJob, salary_range: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Job description..."
                      rows={4}
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Requirements</Label>
                    <Textarea
                      placeholder="Skills and qualifications required..."
                      rows={3}
                      value={newJob.requirements}
                      onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Apply URL</Label>
                    <Input
                      placeholder="https://..."
                      value={newJob.apply_url}
                      onChange={(e) => setNewJob({ ...newJob, apply_url: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_referral"
                      checked={newJob.is_referral}
                      onChange={(e) => setNewJob({ ...newJob, is_referral: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="is_referral">I can provide a referral for this position</Label>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => createJobMutation.mutate()}
                    disabled={!newJob.title || !newJob.company || createJobMutation.isPending}
                  >
                    {createJobMutation.isPending ? "Posting..." : "Post Job"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs or companies..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full Time</SelectItem>
              <SelectItem value="part-time">Part Time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredJobs?.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No jobs found</h3>
              <p className="text-muted-foreground">Check back later for new opportunities</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs?.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow border-border/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Building2 className="w-4 h-4" />
                        {job.company}
                      </CardDescription>
                    </div>
                    {job.is_referral && (
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        Referral
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {job.job_type}
                    </span>
                  </div>
                  
                  {job.salary_range && (
                    <p className="text-sm font-medium text-primary">{job.salary_range}</p>
                  )}
                  
                  {job.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {job.description}
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    Posted {format(new Date(job.created_at), "MMM d, yyyy")}
                  </p>
                </CardContent>
                <CardFooter className="gap-2">
                  {job.apply_url ? (
                    <Button asChild className="flex-1">
                      <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                        Apply <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      className="flex-1"
                      onClick={() => applyMutation.mutate(job.id)}
                      disabled={applyMutation.isPending}
                    >
                      Apply Now
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default JobsPage;
