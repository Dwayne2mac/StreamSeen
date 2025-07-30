import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Plus, CheckCircle, UserPlus, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ActivityWithUser } from "@/types";

interface ActivityFeedProps {
  activities: ActivityWithUser[];
  isLoading: boolean;
}

export default function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-400 mb-2">No friend activity yet</p>
        <p className="text-sm text-gray-500">
          Connect with friends to see their watching activity here
        </p>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'watched':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'added_to_watchlist':
        return <Plus className="w-4 h-4 text-blue-500" />;
      case 'rated':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'friend_added':
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityDescription = (activity: ActivityWithUser) => {
    switch (activity.type) {
      case 'watched':
        return `watched ${activity.title}${activity.year ? ` (${activity.year})` : ''}`;
      case 'added_to_watchlist':
        return `added ${activity.title}${activity.year ? ` (${activity.year})` : ''} to their watchlist`;
      case 'rated':
        return `rated ${activity.title}${activity.year ? ` (${activity.year})` : ''} ${activity.rating}/5 stars`;
      case 'friend_added':
        return `became friends with ${activity.friendName}`;
      default:
        return 'had some activity';
    }
  };

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <Card key={activity.id} className="bg-gray-700 border-gray-600">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-gray-600 text-white text-xs">
                  {activity.user.firstName?.[0]}{activity.user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getActivityIcon(activity.type)}
                  <span className="text-sm font-medium text-white">
                    {activity.user.firstName} {activity.user.lastName}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-1">
                  {getActivityDescription(activity)}
                </p>
                {activity.comment && (
                  <p className="text-xs text-gray-400 italic mb-1">
                    "{activity.comment}"
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(activity.createdAt!), { addSuffix: true })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}