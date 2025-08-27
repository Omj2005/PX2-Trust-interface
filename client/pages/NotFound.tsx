import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <DashboardLayout>
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center animate-fadeInUp">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-slate-900 dark:text-slate-100 mb-4">404</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Oops! The page you're looking for doesn't exist.
          </p>
          <Button asChild className="hover:scale-105 transition-transform duration-200">
            <a href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Dashboard
            </a>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotFound;
