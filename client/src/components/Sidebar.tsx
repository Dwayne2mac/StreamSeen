import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Users, 
  Search, 
  Settings, 
  PlayCircle, 
  Bookmark, 
  List,
  LogOut 
} from "lucide-react";
import type { UserStats, FriendRequestWithUser } from "@/types";

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const { data: stats } = useQuery<UserStats>({
    queryKey: ['/api/users/stats'],
  });

  const { data: friendRequests = [] } = useQuery<FriendRequestWithUser[]>({
    queryKey: ['/api/friends/requests'],
  });

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Friends", href: "/friends", icon: Users, badge: friendRequests.length > 0 ? friendRequests.length : undefined },
    { name: "Discovery", href: "/discovery", icon: Search },
    { name: "Watch Tonight", href: "/watch-tonight", icon: PlayCircle },
    { name: "Streaming Search", href: "/streaming-search", icon: Search },
    { name: "My Lists", href: "/my-lists", icon: List },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImageUrl} />
            <AvatarFallback className="bg-gray-600 text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.firstName || 'User'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="text-center p-2 bg-gray-700 rounded">
              <div className="text-white font-medium">{stats.watchlistCount}</div>
              <div className="text-gray-400">Watchlist</div>
            </div>
            <div className="text-center p-2 bg-gray-700 rounded">
              <div className="text-white font-medium">{stats.watchedCount}</div>
              <div className="text-gray-400">Watched</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </div>
  );
}