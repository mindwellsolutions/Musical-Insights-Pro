'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Users, DollarSign, AlertCircle } from 'lucide-react';
import { useAdminSubscriptionAnalytics } from '@/hooks/admin/useAdminSubscriptions';

export function SubscriptionAnalytics() {
  const { data: analytics, isLoading, error } = useAdminSubscriptionAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Failed to load analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.newSubscribers} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.mrr)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(analytics.arr)} ARR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.churnRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.churnedSubscribers} churned this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>Breakdown by subscription status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Badge variant="default" className="w-full justify-center">Active</Badge>
              <p className="text-2xl font-bold text-center">{analytics.statusCounts.active}</p>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary" className="w-full justify-center">Trialing</Badge>
              <p className="text-2xl font-bold text-center">{analytics.statusCounts.trialing}</p>
            </div>
            <div className="space-y-2">
              <Badge variant="destructive" className="w-full justify-center">Past Due</Badge>
              <p className="text-2xl font-bold text-center">{analytics.statusCounts.past_due}</p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="w-full justify-center">Canceled</Badge>
              <p className="text-2xl font-bold text-center">{analytics.statusCounts.canceled}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Plans Distribution</CardTitle>
          <CardDescription>Subscribers and revenue by plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.planCounts).map(([planName, data]) => (
              <div key={planName} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{planName}</p>
                  <p className="text-sm text-muted-foreground">{data.count} subscribers</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(data.revenue)}</p>
                  <p className="text-sm text-muted-foreground">MRR</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

