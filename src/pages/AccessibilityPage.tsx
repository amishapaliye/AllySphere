import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Keyboard, Monitor, Volume2 } from 'lucide-react';

const AccessibilityPage: React.FC = () => {
  const features = [
    { icon: Eye, title: 'Visual Accessibility', description: 'High contrast modes, scalable fonts, and semantic color tokens ensure readability for all users.' },
    { icon: Keyboard, title: 'Keyboard Navigation', description: 'Full keyboard navigation support across all pages, menus, and interactive elements.' },
    { icon: Monitor, title: 'Screen Reader Support', description: 'Proper ARIA labels, roles, and landmarks for seamless screen reader compatibility.' },
    { icon: Volume2, title: 'Multimedia', description: 'Alt text on all images and descriptive labels on interactive content.' },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container py-12 max-w-3xl">
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">Accessibility</h1>
          <p className="text-lg text-muted-foreground mb-8">
            AllySphere is committed to making our platform accessible to everyone, including people with disabilities.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Card key={i} className="border-border/50">
                  <CardContent className="p-6">
                    <Icon className="h-6 w-6 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Card className="mt-8 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <h2 className="font-semibold text-foreground mb-2">Report an Issue</h2>
              <p className="text-sm text-muted-foreground">
                If you encounter any accessibility barriers while using AllySphere, please reach out to us at{' '}
                <a href="mailto:accessibility@allysphere.in" className="text-primary hover:underline">accessibility@allysphere.in</a>.
                We're continuously improving to serve all members of our community.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AccessibilityPage;
