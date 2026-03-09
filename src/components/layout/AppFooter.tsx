import React from 'react';
import { Link } from 'react-router-dom';
import acetLogo from '@/assets/acet-logo.jpeg';

const AppFooter: React.FC = () => {
  const footerLinks = [
    { label: 'About', path: '/about' },
    { label: 'Accessibility', path: '/accessibility' },
    { label: 'Help Center', path: '/help-center' },
  ];

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container py-4">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className="text-muted-foreground hover:text-primary hover:underline transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/privacy"
            className="text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            Privacy & Terms ▾
          </Link>
          <Link
            to="/advertising"
            className="text-primary hover:underline transition-colors"
          >
            Advertising
          </Link>
          <span className="text-muted-foreground">
            Get the AllySphere app
          </span>
          <span className="text-muted-foreground">
            More
          </span>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          <img
            src={acetLogo}
            alt="ACET Logo"
            className="h-5 w-5 object-contain rounded-full"
          />
          <span className="text-xs text-muted-foreground">
            AllySphere · ACET Alumni Network © {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
