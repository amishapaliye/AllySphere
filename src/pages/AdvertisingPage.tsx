import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Megaphone, Sparkles, Rocket } from 'lucide-react';

const AdvertisingPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center bg-background">
        <div className="container max-w-lg text-center py-16">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Megaphone className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">
            Advertising
          </h1>
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-semibold text-accent mb-6">
            <Rocket className="h-4 w-4" />
            Launching Soon
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            We're building advertising tools to help companies reach ACET alumni and students. 
            Promote job listings, events, and services to a highly engaged professional community.
          </p>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 justify-center mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Stay Tuned</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Advertising features will be available soon. Check back later for updates on sponsored posts, 
                job promotions, and event sponsorships.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdvertisingPage;
