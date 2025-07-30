import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { FriendRequestWithUser } from "@/types";

export default function Header() {
  const { data: friendRequests = [] } = useQuery<FriendRequestWithUser[]>({
    queryKey: ['/api/friends/requests'],
  });

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">StreamSeen</h1>
          <p className="text-sm text-gray-400">Your social streaming companion</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative text-gray-300 hover:text-white">
            <Bell className="w-5 h-5" />
            {friendRequests.length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {friendRequests.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}