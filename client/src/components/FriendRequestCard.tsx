import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { FriendRequest } from "@/types";

interface FriendRequestCardProps {
  request: FriendRequest;
  compact?: boolean;
}

export default function FriendRequestCard({ request, compact = false }: FriendRequestCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/friends/accept', { friendId: request.userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/stats'] });
      toast({
        title: "Friend Request Accepted",
        description: `You are now friends with ${request.friend.firstName || 'this user'}.`,
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
        description: "Failed to accept friend request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/friends/decline', { friendId: request.userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends/requests'] });
      toast({
        title: "Friend Request Declined",
        description: "The friend request has been declined.",
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
        description: "Failed to decline friend request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAccept = () => {
    acceptMutation.mutate();
  };

  const handleDecline = () => {
    declineMutation.mutate();
  };

  const profileImage = request.friend.profileImageUrl || 
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=40&h=40';

  return (
    <div className={`flex items-center justify-between p-3 bg-gray-700 rounded-lg ${compact ? '' : 'animate-fade-in'}`}>
      <div className="flex items-center gap-3">
        <img 
          src={profileImage} 
          alt={request.friend.firstName || 'User'} 
          className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full object-cover`}
        />
        <div>
          <p className={`font-medium text-white ${compact ? 'text-sm' : ''}`}>
            {request.friend.showRealName && request.friend.firstName && request.friend.lastName 
              ? `${request.friend.firstName} ${request.friend.lastName}` 
              : request.friend.firstName || 'Anonymous User'
            }
          </p>
          <p className={`text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
            @{request.friend.email?.split('@')[0] || 'user'}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          size={compact ? "sm" : "default"}
          onClick={handleAccept}
          disabled={acceptMutation.isPending || declineMutation.isPending}
          className={`bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors ${
            compact ? 'text-xs px-2 py-1' : 'px-3 py-1 text-sm'
          }`}
        >
          Accept
        </Button>
        <Button 
          size={compact ? "sm" : "default"}
          variant="secondary"
          onClick={handleDecline}
          disabled={acceptMutation.isPending || declineMutation.isPending}
          className={`bg-gray-600 hover:bg-gray-500 text-white font-medium transition-colors ${
            compact ? 'text-xs px-2 py-1' : 'px-3 py-1 text-sm'
          }`}
        >
          Decline
        </Button>
      </div>
    </div>
  );
}
