import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import FriendRequestCard from "@/components/FriendRequestCard";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Friends() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['/api/friends'],
  });

  const { data: friendRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/friends/requests'],
  });

  const { data: friendsActivity = [], isLoading: activityLoading } = useQuery({
    queryKey: ['/api/friends/activity'],
  });

  const removeFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      await apiRequest('DELETE', `/api/friends/${friendId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/stats'] });
      toast({
        title: "Friend Removed",
        description: "The friend has been removed from your list.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to remove friend. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRemoveFriend = (friendId: string) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      removeFriendMutation.mutate(friendId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Friends</h1>
        <p className="text-gray-400 mt-2">Manage your connections and discover what friends are watching</p>
      </div>

      {/* Friend Management Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Friend Requests */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Requests</h2>
              {friendRequests.length > 0 && (
                <Badge variant="destructive">{friendRequests.length}</Badge>
              )}
            </div>
            <div className="space-y-3">
              {requestsLoading ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-700 rounded"></div>
                  ))}
                </div>
              ) : friendRequests.length > 0 ? (
                friendRequests.map((request) => (
                  <FriendRequestCard key={request.id} request={request} compact />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">No pending requests</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Friends */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Friends</h2>
              <span className="text-gray-400 text-sm">{friends.length}</span>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {friendsLoading ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-700 rounded"></div>
                  ))}
                </div>
              ) : friends.length > 0 ? (
                friends.map((friend: any) => (
                  <div key={friend.id} className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <img 
                        src={friend.profileImageUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=32&h=32`} 
                        alt={friend.firstName || 'Friend'} 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-white text-sm">
                          {friend.showRealName && friend.firstName && friend.lastName 
                            ? `${friend.firstName} ${friend.lastName}` 
                            : friend.firstName || 'Anonymous'
                          }
                        </p>
                        <p className="text-xs text-gray-400">Online now</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white text-xs">
                        View
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-400 hover:text-red-300 text-xs"
                        onClick={() => handleRemoveFriend(friend.id)}
                        disabled={removeFriendMutation.isPending}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">No friends yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Friend Activity */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {activityLoading ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-700 rounded"></div>
                  ))}
                </div>
              ) : friendsActivity.length > 0 ? (
                friendsActivity.slice(0, 5).map((activity: any) => (
                  <div key={activity.id} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-start gap-2">
                      <img 
                        src={activity.user.profileImageUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=24&h=24`} 
                        alt={activity.user.firstName || 'User'} 
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-300">
                          <span className="font-medium text-white">
                            {activity.user.firstName || 'Someone'}
                          </span>{' '}
                          {activity.type === 'watched' && `watched ${activity.title}`}
                          {activity.type === 'added_to_watchlist' && `added ${activity.title} to watchlist`}
                          {activity.type === 'rated' && `rated ${activity.title} ${activity.rating}⭐`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
