import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HelpCenterPage: React.FC = () => {
  const faqs = [
    { q: 'How do I create my profile?', a: 'After signing up, you\'ll be guided through a profile setup flow where you can add your name, department, graduation year, and other details.' },
    { q: 'How do I find a mentor?', a: 'Visit the Mentorship page from the navigation menu. You can browse available mentors or get AI-powered recommendations based on your career interests.' },
    { q: 'How do I post a job?', a: 'Alumni can post jobs by visiting the Jobs page and clicking "Post a Job." Fill in the job details, requirements, and application instructions.' },
    { q: 'How do I donate to a campaign?', a: 'Go to the Fundraising page, select a campaign, and click "Donate." You can contribute any amount securely.' },
    { q: 'How do I message someone?', a: 'Visit any alumni or student profile and click the "Message" button. You can also access all conversations from the Messages page.' },
    { q: 'Can I edit my profile later?', a: 'Yes! Go to Profile Settings from the avatar dropdown in the top-right corner to update your information anytime.' },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container py-12 max-w-3xl">
          <div className="text-center mb-8">
            <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">Help Center</h1>
            <p className="text-lg text-muted-foreground">Find answers to common questions about AllySphere.</p>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-lg px-4">
                <AccordionTrigger className="text-foreground font-medium text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Card className="mt-8 border-primary/20">
            <CardContent className="p-6 text-center">
              <h2 className="font-semibold text-foreground mb-2">Still need help?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Reach out to us and we'll get back to you within 24 hours.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" asChild>
                  <a href="mailto:support@allysphere.in">
                    <Mail className="mr-2 h-4 w-4" /> Email Support
                  </a>
                </Button>
                <Button asChild>
                  <Link to="/messages">
                    <MessageSquare className="mr-2 h-4 w-4" /> Send Message
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default HelpCenterPage;
