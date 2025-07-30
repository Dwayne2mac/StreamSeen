import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Play, 
  Search, 
  Bookmark, 
  Users, 
  Settings,
  UserPlus 
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Watch Tonight', href: '/watch-tonight', icon: Play },
  { name: 'Streaming Search', href: '/streaming-search', icon: Search },
  { name: 'My Lists', href: '/my-lists', icon: Bookmark },
  { name: 'Friends', href: '/friends', icon: Users },
  { name: 'Discover', href: '/discovery', icon: UserPlus },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['/api/users/stats'],
  });

  const { data: friendRequests = [] } = useQuery({
    queryKey: ['/api/friends/requests'],
  });

  const profileImage = user?.profileImageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=32&h=32';

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-white">StreamSeen</span>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="px-4 py-4 border-b border-gray-700">
        <button 
          onClick={() => setLocation('/profile')}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors w-full text-left"
        >
          <img 
            src={profileImage} 
            alt="User Avatar" 
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.firstName || 'User'
              }
            </p>
            <p className="text-xs text-gray-400 truncate">
              @{user?.email?.split('@')[0] || 'user'}
            </p>
          </div>
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-subtle"></div>
          </div>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <button
              key={item.name}
              onClick={() => setLocation(item.href)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left",
                isActive 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
              {item.name === 'My Lists' && stats && (
                <span className="ml-auto bg-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {stats.watchlistCount}
                </span>
              )}
              {item.name === 'Friends' && friendRequests.length > 0 && (
                <span className="ml-auto bg-red-500 text-xs px-1.5 py-0.5 rounded-full">
                  {friendRequests.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <button
          onClick={() => setLocation('/settings')}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left",
            location === '/settings'
              ? "bg-indigo-600 text-white"
              : "text-gray-300 hover:bg-gray-700 hover:text-white"
          )}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
