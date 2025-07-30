import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { FriendRequestWithUser } from "@/types";

interface FriendRequestCardProps {
  request: FriendRequestWithUser;
}

export default function FriendRequestCard({ request }: FriendRequestCardProps) {
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
        title: "Friend request accepted",
        description: `You are now friends with ${request.user.firstName}`,
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
        description: "Failed to accept friend request",
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
        title: "Friend request declined",
        description: "Request has been declined",
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
        description: "Failed to decline friend request",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="bg-gray-700 border-gray-600">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={request.user.profileImageUrl} />
              <AvatarFallback className="bg-gray-600 text-white">
                {request.user.firstName?.[0]}{request.user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-white">
                {request.user.firstName} {request.user.lastName}
              </p>
              <p className="text-sm text-gray-400">Wants to be friends</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => declineMutation.mutate()}
              disabled={declineMutation.isPending}
              className="border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              Decline
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}