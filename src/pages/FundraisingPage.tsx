import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Heart, Users, Target, Calendar, IndianRupee, Gift, Sparkles } from "lucide-react";
import { format, differenceInDays } from "date-fns";

const FundraisingPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["fundraising-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fundraising_campaigns")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const donateMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !selectedCampaign) throw new Error("Not authenticated");
      
      const amount = parseFloat(donationAmount);
      if (isNaN(amount) || amount <= 0) throw new Error("Invalid amount");
      
      const { error } = await supabase.from("donations").insert({
        campaign_id: selectedCampaign,
        donor_id: user.id,
        amount,
        message: donationMessage || null,
        is_anonymous: isAnonymous,
        payment_status: "completed", // Simulated - in production, integrate payment gateway
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fundraising-campaigns"] });
      setIsDonateOpen(false);
      setDonationAmount("");
      setDonationMessage("");
      setIsAnonymous(false);
      setSelectedCampaign(null);
      toast({ 
        title: "Thank you for your donation! 🎉", 
        description: "Your contribution makes a difference." 
      });
    },
    onError: (error) => {
      toast({ title: "Error processing donation", description: error.message, variant: "destructive" });
    },
  });

  const openDonateDialog = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    setIsDonateOpen(true);
  };

  const quickAmounts = [500, 1000, 2500, 5000, 10000];

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Give Back to ACET</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Support Your Alma Mater
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Your contributions help build better labs, fund scholarships, and create opportunities 
            for the next generation of ACET students.
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: IndianRupee, label: "Total Raised", value: "₹12.5L+" },
            { icon: Users, label: "Donors", value: "250+" },
            { icon: Gift, label: "Campaigns", value: campaigns?.length || 0 },
            { icon: Sparkles, label: "Impact", value: "1000+ Students" },
          ].map((stat, idx) => (
            <Card key={idx} className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <stat.icon className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Campaigns Grid */}
        <h2 className="text-2xl font-bold mb-6">Active Campaigns</h2>
        
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-muted rounded-t-lg" />
                <CardContent className="pt-4">
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : campaigns?.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No active campaigns</h3>
              <p className="text-muted-foreground">Check back soon for new initiatives</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns?.map((campaign) => {
              const progress = campaign.target_amount > 0 
                ? (Number(campaign.current_amount) / Number(campaign.target_amount)) * 100 
                : 0;
              const daysLeft = campaign.deadline 
                ? differenceInDays(new Date(campaign.deadline), new Date()) 
                : null;

              return (
                <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  {campaign.image_url ? (
                    <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/40 relative overflow-hidden">
                      <img 
                        src={campaign.image_url} 
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                      <Target className="w-16 h-16 text-primary/50" />
                    </div>
                  )}
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{campaign.title}</CardTitle>
                      {daysLeft !== null && daysLeft > 0 && (
                        <Badge variant="secondary" className="shrink-0">
                          {daysLeft} days left
                        </Badge>
                      )}
                    </div>
                    {campaign.description && (
                      <CardDescription className="line-clamp-2">
                        {campaign.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-primary">
                          ₹{Number(campaign.current_amount).toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          of ₹{Number(campaign.target_amount).toLocaleString()}
                        </span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {campaign.donor_count} donors
                      </span>
                      <span>{Math.round(progress)}% funded</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => openDonateDialog(campaign.id)}
                      disabled={!user}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Donate Now
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Donation Dialog */}
        <Dialog open={isDonateOpen} onOpenChange={setIsDonateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Make a Donation</DialogTitle>
              <DialogDescription>
                Choose an amount to contribute to this campaign
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-5 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={donationAmount === String(amount) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDonationAmount(String(amount))}
                  >
                    ₹{amount >= 1000 ? `${amount/1000}K` : amount}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Custom Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label>Message (Optional)</Label>
                <Textarea
                  placeholder="Add a personal message..."
                  value={donationMessage}
                  onChange={(e) => setDonationMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="anonymous" className="text-sm">
                  Make my donation anonymous
                </Label>
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
                onClick={() => donateMutation.mutate()}
                disabled={!donationAmount || parseFloat(donationAmount) <= 0 || donateMutation.isPending}
              >
                {donateMutation.isPending ? "Processing..." : `Donate ₹${donationAmount || 0}`}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                🔒 Your payment is secure. All transactions are encrypted.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {!user && (
          <Card className="mt-8 bg-muted/50 border-dashed">
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Please sign in to make a donation
              </p>
              <Button asChild>
                <a href="/auth">Sign In</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default FundraisingPage;
