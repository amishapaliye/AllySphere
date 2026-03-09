import React from 'react';
import Layout from '@/components/layout/Layout';
import { Shield } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container py-12 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="font-display text-4xl font-bold text-foreground">Privacy & Terms</h1>
          </div>

          <div className="prose prose-sm max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-foreground">Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                AllySphere respects your privacy and is committed to protecting your personal data. 
                We collect only the information necessary to provide our alumni networking services, 
                including your name, email, graduation details, and professional information you choose to share.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Your data is stored securely and is never sold to third parties. 
                We use industry-standard encryption and security practices to protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Terms of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                By using AllySphere, you agree to use the platform responsibly and respectfully. 
                Users must provide accurate profile information and refrain from harassment, spam, or misuse of the messaging system.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                AllySphere reserves the right to suspend accounts that violate community guidelines. 
                Content posted on forums and messages should be professional and relevant to the ACET community.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Data Usage</h2>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Profile data is used for alumni directory and mentor matching</li>
                <li>AI features use anonymized data for recommendations</li>
                <li>Donation records are kept confidential as per donor preferences</li>
                <li>Messages are private between sender and receiver</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Contact</h2>
              <p className="text-muted-foreground">
                For privacy concerns, contact us at{' '}
                <a href="mailto:privacy@allysphere.in" className="text-primary hover:underline">privacy@allysphere.in</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPage;
