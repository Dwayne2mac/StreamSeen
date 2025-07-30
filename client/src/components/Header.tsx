import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Bell } from "lucide-react";
import { useLocation } from "wouter";

const pageNames = {
  '/': 'Dashboard',
  '/profile': 'Profile',
  '/friends': 'Friends',
  '/discovery': 'Discover Friends',
  '/settings': 'Settings',
  '/watch-tonight': 'Watch Tonight',
  '/streaming-search': 'Streaming Search',
  '/my-lists': 'My Lists',
};

export default function Header() {
  const [location, setLocation] = useLocation();
  
  const { data: friendRequests = [] } = useQuery({
    queryKey: ['/api/friends/requests'],
  });

  const pageName = pageNames[location as keyof typeof pageNames] || 'StreamSeen';

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{pageName}</h1>
          {location === '/' && (
            <p className="text-gray-400 text-sm">Welcome back! Here's what's happening.</p>
          )}
          {location === '/friends' && (
            <p className="text-gray-400 text-sm">Manage your connections and discover what friends are watching</p>
          )}
          {location === '/discovery' && (
            <p className="text-gray-400 text-sm">Find people with similar taste in movies and shows</p>
          )}
          {location === '/settings' && (
            <p className="text-gray-400 text-sm">Control who can see your activity and watchlists</p>
          )}
          {location === '/watch-tonight' && (
            <p className="text-gray-400 text-sm">Get personalized AI recommendations based on your preferences</p>
          )}
          {location === '/streaming-search' && (
            <p className="text-gray-400 text-sm">Find where any movie or TV show is streaming in the UK</p>
          )}
          {location === '/my-lists' && (
            <p className="text-gray-400 text-sm">Keep track of what you want to watch and what you've seen</p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Friend Requests Notification */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/friends')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Users className="w-6 h-6" />
            </Button>
            {friendRequests.length > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
                {friendRequests.length}
              </Badge>
            )}
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Bell className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
