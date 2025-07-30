import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Search } from "lucide-react";

export default function Discovery() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suggestedFriends = [], isLoading: suggestedLoading } = useQuery({
    queryKey: ['/api/friends/suggested'],
  });

  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ['/api/friends/search', searchQuery],
    enabled: searchQuery.length > 2,
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (friendId: string) => {
      await apiRequest('POST', '/api/friends/request', { friendId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends/suggested'] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends/sent-requests'] });
      toast({
        title: "Friend Request Sent",
        description: "Your friend request has been sent successfully.",
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
        description: error.message || "Failed to send friend request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendRequest = (friendId: string) => {
    sendRequestMutation.mutate(friendId);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the query
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Discover Friends</h1>
        <p className="text-gray-400 mt-2">Find people with similar taste in movies and shows</p>
      </div>

      {/* Search Bar */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchQuery.length > 2 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Search Results</h2>
            {searchLoading ? (
              <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-700 rounded"></div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((user: any) => (
                  <div key={user.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <img 
                        src={user.profileImageUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=64&h=64`} 
                        alt={user.firstName || 'User'} 
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white">
                          {user.showRealName && user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.firstName || 'Anonymous User'
                          }
                        </h3>
                        <p className="text-sm text-gray-400">@{user.email?.split('@')[0] || 'user'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                        <Button 
                          size="sm"
                          className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => handleSendRequest(user.id)}
                          disabled={sendRequestMutation.isPending}
                        >
                          Send Request
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No users found for "{searchQuery}"</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Suggested Friends */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Suggested Friends</h2>
          {suggestedLoading ? (
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : suggestedFriends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedFriends.map((user: any) => (
                <div key={user.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <img 
                      src={user.profileImageUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=64&h=64`} 
                      alt={user.firstName || 'User'} 
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white">
                        {user.showRealName && user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user.firstName || 'Anonymous User'
                        }
                      </h3>
                      <p className="text-sm text-gray-400">@{user.email?.split('@')[0] || 'user'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Similar interests
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">Movies</Badge>
                        <Badge variant="secondary" className="text-xs">TV Shows</Badge>
                      </div>
                      <Button 
                        size="sm"
                        className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => handleSendRequest(user.id)}
                        disabled={sendRequestMutation.isPending}
                      >
                        Send Request
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No suggested friends at the moment</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
