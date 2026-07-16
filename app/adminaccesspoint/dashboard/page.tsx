'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client-ssr';
import { ReviewWithImages } from '@/lib/validations/review-schema';
import { AdminReviewCard } from '@/components/reviews/AdminReviewCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogOut, Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

/**
 * Admin Dashboard Page
 * Manage pending and approved reviews
 */
export default function AdminDashboardPage() {
  const [pendingReviews, setPendingReviews] = useState<ReviewWithImages[]>([]);
  const [approvedReviews, setApprovedReviews] = useState<ReviewWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
    fetchReviews();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/adminaccesspoint');
    } else {
      setUser(user);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch pending reviews
      const pendingResponse = await fetch('/api/reviews/admin/pending');
      if (!pendingResponse.ok) throw new Error('Failed to fetch pending reviews');
      const pendingData = await pendingResponse.json();
      setPendingReviews(pendingData.reviews || []);

      // Fetch approved reviews
      const approvedResponse = await fetch('/api/reviews/admin/approved');
      if (!approvedResponse.ok) throw new Error('Failed to fetch approved reviews');
      const approvedData = await approvedResponse.json();
      setApprovedReviews(approvedData.reviews || []);

    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      const response = await fetch('/api/reviews/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId })
      });

      if (!response.ok) throw new Error('Failed to approve review');

      // Refresh reviews
      await fetchReviews();
    } catch (err: any) {
      console.error('Error approving review:', err);
      alert('Failed to approve review');
    }
  };

  const handleUnapprove = async (reviewId: string) => {
    try {
      const response = await fetch('/api/reviews/admin/unapprove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId })
      });

      if (!response.ok) throw new Error('Failed to unapprove review');

      // Refresh reviews
      await fetchReviews();
    } catch (err: any) {
      console.error('Error unapproving review:', err);
      alert('Failed to unapprove review');
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      const response = await fetch('/api/reviews/admin/reject', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId })
      });

      if (!response.ok) throw new Error('Failed to delete review');

      // Refresh reviews
      await fetchReviews();
    } catch (err: any) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/adminaccesspoint');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Review Management Dashboard</h1>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <span className="text-3xl font-bold">{pendingReviews.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Approved Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-3xl font-bold">{approvedReviews.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                <span className="text-3xl font-bold">
                  {pendingReviews.length + approvedReviews.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Reviews */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Pending Reviews ({pendingReviews.length})
            </h2>
            <div className="space-y-4">
              {pendingReviews.length > 0 ? (
                pendingReviews.map((review) => (
                  <AdminReviewCard
                    key={review.id}
                    review={review}
                    onApprove={handleApprove}
                    onDelete={handleDelete}
                    isApproved={false}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    No pending reviews
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Approved Reviews */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Approved Reviews ({approvedReviews.length})
            </h2>
            <div className="space-y-4">
              {approvedReviews.length > 0 ? (
                approvedReviews.map((review) => (
                  <AdminReviewCard
                    key={review.id}
                    review={review}
                    onUnapprove={handleUnapprove}
                    onDelete={handleDelete}
                    isApproved={true}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    No approved reviews yet
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


