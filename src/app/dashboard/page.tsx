'use client';

import React, { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { MyTasksView } from '@/components/dashboard/MyTasksView';
import { AnalyticsView } from '@/components/dashboard/AnalyticsView';

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <Tabs defaultValue="my-tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="my-tasks" className="space-y-4">
          <Suspense fallback={<DashboardSkeleton />}>
            <MyTasksView />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Suspense fallback={<DashboardSkeleton />}>
            <AnalyticsView />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}