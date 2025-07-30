import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Profile() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['/api/users/stats'],
  });

  const { data: friendsActivity = [] } = useQuery({
    queryKey: ['/api/friends/activity'],
  });

  if (!user) return null;

  // Get user's recent activity from friends activity (their own activities)
  const userActivity = friendsActivity.filter(activity => activity.userId === user.id).slice(0, 5);

  const profileImage = user.profileImageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128';

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <Card className="bg-gray-800 border-gray-700 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
        
        <CardContent className="px-6 pb-6">
          <div className="flex items-start gap-4 -mt-16">
            <img 
              src={profileImage} 
              alt={user.firstName || 'User'} 
              className="w-32 h-32 rounded-2xl border-4 border-gray-800 object-cover"
            />
            <div className="flex-1 mt-16">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {user.showRealName && user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.firstName || 'Anonymous User'
                    }
                  </h1>
                  <p className="text-gray-400">@{user.email?.split('@')[0] || 'user'}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Joined {new Date(user.createdAt!).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
          
          {/* Bio */}
          <div className="mt-4">
            <p className="text-gray-300">
              {user.bio || "Movie enthusiast and series binger. Always looking for the next great story to watch. 🎬✨"}
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{stats?.watchedCount || 0}</span>
              <span className="text-gray-400">Watched</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{stats?.watchlistCount || 0}</span>
              <span className="text-gray-400">Watchlist</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{stats?.friendsCount || 0}</span>
              <span className="text-gray-400">Friends</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">4.2</span>
              <span className="text-gray-400">Avg Rating</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content Tabs */}
      <Card className="bg-gray-800 border-gray-700">
        <Tabs defaultValue="activity" className="w-full">
          <div className="border-b border-gray-700">
            <TabsList className="w-full justify-start bg-transparent">
              <TabsTrigger value="activity" className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-400 data-[state=active]:border-b-2 data-[state=active]:border-indigo-400">
                Recent Activity
              </TabsTrigger>
              <TabsTrigger value="genres" className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-400 data-[state=active]:border-b-2 data-[state=active]:border-indigo-400">
                Favorite Genres
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-400 data-[state=active]:border-b-2 data-[state=active]:border-indigo-400">
                Reviews
              </TabsTrigger>
            </TabsList>
          </div>
          
          <CardContent className="p-6">
            <TabsContent value="activity" className="mt-0">
              <div className="space-y-4">
                {userActivity.length > 0 ? (
                  userActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-700 rounded-lg">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'watched' ? 'bg-green-600' : 
                        activity.type === 'added_to_watchlist' ? 'bg-indigo-600' :
                        activity.type === 'rated' ? 'bg-yellow-600' : 'bg-blue-600'
                      }`}>
                        {activity.type === 'watched' && (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        )}
                        {activity.type === 'added_to_watchlist' && (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                          </svg>
                        )}
                        {activity.type === 'rated' && (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium">
                          {activity.type === 'watched' && `Watched ${activity.title}`}
                          {activity.type === 'added_to_watchlist' && `Added ${activity.title} to watchlist`}
                          {activity.type === 'rated' && `Rated ${activity.title}`}
                        </p>
                        {activity.rating && (
                          <p className="text-gray-400 text-sm">Rated {activity.rating}⭐ {activity.comment && `• "${activity.comment}"`}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(activity.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="genres" className="mt-0">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-indigo-600 text-white">Sci-Fi</Badge>
                  <Badge variant="secondary" className="bg-purple-600 text-white">Thriller</Badge>
                  <Badge variant="secondary" className="bg-green-600 text-white">Drama</Badge>
                  <Badge variant="secondary" className="bg-blue-600 text-white">Action</Badge>
                  <Badge variant="secondary" className="bg-red-600 text-white">Horror</Badge>
                </div>
                <p className="text-gray-400 text-sm mt-4">
                  Based on your watching history and ratings
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-0">
              <div className="space-y-4">
                <p className="text-gray-500 text-center py-8">
                  Your reviews and detailed ratings will appear here
                </p>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
