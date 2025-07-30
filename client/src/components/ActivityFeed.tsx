import type { Activity } from "@/types";

interface ActivityFeedProps {
  activities: Activity[];
  isLoading?: boolean;
}

export default function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        No recent activity from friends
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3">
          <img 
            src={activity.user?.profileImageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=32&h=32'} 
            alt={activity.user?.firstName || 'User'} 
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-300">
              <span className="font-medium text-white">
                {activity.user?.firstName || 'Someone'}
              </span>{' '}
              {activity.type === 'watched' && (
                <>
                  watched <span className="font-medium text-indigo-400">{activity.title}</span>
                  {activity.rating && ` and rated it ${activity.rating}⭐`}
                </>
              )}
              {activity.type === 'added_to_watchlist' && (
                <>
                  added <span className="font-medium text-indigo-400">{activity.title}</span> to watchlist
                </>
              )}
              {activity.type === 'rated' && (
                <>
                  rated <span className="font-medium text-indigo-400">{activity.title}</span> {activity.rating}⭐
                </>
              )}
              {activity.type === 'friend_added' && (
                <>
                  connected with <span className="font-medium text-indigo-400">{activity.friendName}</span>
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(activity.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
