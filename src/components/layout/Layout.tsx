import React from 'react';
import Navbar from './Navbar';
import AppFooter from './AppFooter';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showNavbar = true }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      {user && <AppFooter />}
    </div>
  );
};

export default Layout;
