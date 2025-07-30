import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import FriendRequestCard from "@/components/FriendRequestCard";
import ActivityFeed from "@/components/ActivityFeed";
import { useLocation } from "wouter";
import { Bookmark, CheckCircle, Users, Calendar } from "lucide-react";
import type { UserStats, FriendRequestWithUser, ActivityWithUser } from "@/types";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['/api/users/stats'],
  });

  const { data: friendRequests = [], isLoading: requestsLoading } = useQuery<FriendRequestWithUser[]>({
    queryKey: ['/api/friends/requests'],
  });

  const { data: friendsActivity = [], isLoading: activityLoading } = useQuery<ActivityWithUser[]>({
    queryKey: ['/api/friends/activity'],
  });

  if (statsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm">
          Welcome back, {user?.firstName || 'there'}! Here's what's happening.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Watchlist</p>
                <p className="text-2xl font-bold text-white">{stats?.watchlistCount || 0}</p>
              </div>
              <div className="p-3 bg-indigo-600 rounded-lg">
                <Bookmark className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Watched</p>
                <p className="text-2xl font-bold text-white">{stats?.watchedCount || 0}</p>
              </div>
              <div className="p-3 bg-green-600 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Friends</p>
                <p className="text-2xl font-bold text-white">{stats?.friendsCount || 0}</p>
              </div>
              <div className="p-3 bg-blue-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">This Month</p>
                <p className="text-2xl font-bold text-white">{stats?.thisMonthCount || 0}</p>
              </div>
              <div className="p-3 bg-purple-600 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Friend Requests Section */}
      {!requestsLoading && friendRequests.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Friend Requests</h2>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {friendRequests.length} pending
              </span>
            </div>
            <div className="space-y-3">
              {friendRequests.slice(0, 3).map((request) => (
                <FriendRequestCard key={request.id} request={request} />
              ))}
              {friendRequests.length > 3 && (
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/friends')}
                  className="w-full"
                >
                  View All {friendRequests.length} Requests
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Friends' Activity */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Friends' Activity</h2>
            <ActivityFeed activities={friendsActivity} isLoading={activityLoading} />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button 
                onClick={() => setLocation('/watch-tonight')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg text-left transition-colors justify-start"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  <div>
                    <p className="font-medium">Get Tonight's Recommendation</p>
                    <p className="text-sm text-indigo-200">AI-powered movie suggestions</p>
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => setLocation('/streaming-search')}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg text-left transition-colors justify-start"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <div>
                    <p className="font-medium">Search Streaming Services</p>
                    <p className="text-sm text-gray-400">Find where to watch anything</p>
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => setLocation('/discovery')}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg text-left transition-colors justify-start"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                  </svg>
                  <div>
                    <p className="font-medium">Discover Friends</p>
                    <p className="text-sm text-gray-400">Find people with similar taste</p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
