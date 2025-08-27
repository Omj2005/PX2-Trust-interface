import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Plus } from 'lucide-react';

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="text-center max-w-md mx-auto animate-fadeInUp">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <SettingsIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            This page is a placeholder. Continue prompting to fill in the settings features you'd like to see here.
          </p>
          <Card className="p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Potential Features:</h3>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <li>• General application settings</li>
                <li>• User preferences and profile</li>
                <li>• Security and privacy controls</li>
                <li>• Notification preferences</li>
                <li>• System configuration</li>
              </ul>
              <Button className="w-full mt-4 hover:scale-105 transition-transform duration-200">
                <Plus className="mr-2 h-4 w-4" />
                Continue Building This Page
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
