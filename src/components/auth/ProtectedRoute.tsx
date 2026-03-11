import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppRole } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';
import Layout from '@/components/layout/Layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, userRole, loading } = useAuth();

  // TEMPORARY ADMIN EMAIL
  const adminEmail = "khansuniya16@gmail.com";

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-32 w-full" />
        </div>
      </Layout>
    );
  }

  // If user not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Allow admin email to bypass role check
  if (allowedRoles?.includes("admin" as AppRole)) {
    if (user.email !== adminEmail) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Normal role check for other routes
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;