import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { 
  GraduationCap, 
  Users, 
  Target, 
  Heart, 
  Globe, 
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import acetLogo from '@/assets/acet-logo.jpeg';
import collegeCampus from '@/assets/college-campus.jpg';

const AboutPage: React.FC = () => {
  const values = [
    { icon: Users, title: 'Community First', description: 'Building bridges between students, alumni, and faculty to create a thriving professional ecosystem.' },
    { icon: Target, title: 'Career Growth', description: 'Empowering every member with mentorship, job opportunities, and industry connections.' },
    { icon: Heart, title: 'Giving Back', description: 'Enabling alumni to contribute to their alma mater through donations, mentorship, and knowledge sharing.' },
    { icon: Globe, title: 'Global Network', description: 'Connecting ACET graduates worldwide, transcending geographical boundaries.' },
  ];

  const milestones = [
    { year: '2024', event: 'AllySphere concept born at ACET' },
    { year: '2025', event: 'Platform development begins with AI-powered features' },
    { year: '2026', event: 'Beta launch with 500+ early adopters' },
    { year: 'Future', event: 'Expanding to 5000+ alumni globally' },
  ];

  const team = [
    { name: 'ACET Alumni Cell', role: 'Platform Governance', icon: Award },
    { name: 'Student Volunteers', role: 'Community Management', icon: GraduationCap },
    { name: 'Faculty Advisors', role: 'Strategic Guidance', icon: Sparkles },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Banner */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={collegeCampus} 
              alt="ACET Campus" 
              className="w-full h-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
          </div>
          <div className="container relative py-16 text-center">
            <img 
              src={acetLogo} 
              alt="ACET Logo" 
              className="mx-auto h-20 w-20 rounded-full border-2 border-primary/30 shadow-lg mb-6"
            />
            <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
              About <span className="text-primary">AllySphere</span>
            </h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
              The AI-powered alumni network platform of Anjuman College of Engineering & Technology, Nagpur.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="container py-12">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                AllySphere was created with a singular vision — to bridge the gap between ACET's past, present, 
                and future. We believe that the strongest career networks are built on shared experiences, 
                and no bond is stronger than the one forged during your college years.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Using AI-powered matching, real-time messaging, and a comprehensive alumni directory, 
                AllySphere makes it effortless for students to find mentors, for alumni to give back, 
                and for faculty to stay connected with their former students' journeys.
              </p>
            </div>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <blockquote className="text-lg italic text-foreground">
                  "Where Alumni, Students, and Futures Connect."
                </blockquote>
                <p className="mt-4 text-sm text-muted-foreground">— AllySphere Tagline</p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">5000+</p>
                    <p className="text-xs text-muted-foreground">Alumni Network</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">500+</p>
                    <p className="text-xs text-muted-foreground">Active Mentors</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">200+</p>
                    <p className="text-xs text-muted-foreground">Companies</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">50+</p>
                    <p className="text-xs text-muted-foreground">Events/Year</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Values */}
        <section className="border-y border-border bg-muted/30 py-12">
          <div className="container">
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-8">Our Values</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v, i) => {
                const Icon = v.icon;
                return (
                  <Card key={i} className="border-border/50 hover:border-primary/30 transition-colors">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                      <p className="text-sm text-muted-foreground">{v.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="container py-12">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-8">Our Journey</h2>
          <div className="max-w-2xl mx-auto space-y-0">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-4 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {m.year.slice(-2)}
                  </div>
                  {i < milestones.length - 1 && <div className="w-0.5 flex-1 bg-primary/20 mt-1" />}
                </div>
                <div className="pt-2">
                  <p className="text-sm font-bold text-primary">{m.year}</p>
                  <p className="text-foreground">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="border-t border-border bg-muted/30 py-12">
          <div className="container">
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-8">Behind AllySphere</h2>
            <div className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
              {team.map((t, i) => {
                const Icon = t.icon;
                return (
                  <Card key={i} className="border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground">{t.name}</h3>
                      <p className="text-sm text-muted-foreground">{t.role}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container py-12 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">Ready to join the network?</h2>
          <p className="text-muted-foreground mb-6">Connect with fellow ACET members and grow together.</p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link to="/alumni">
              Explore Alumni <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>
      </div>
    </Layout>
  );
};

export default AboutPage;
