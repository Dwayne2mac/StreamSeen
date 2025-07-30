import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Download, Trash2 } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState({
    publicProfile: user?.publicProfile ?? true,
    showRealName: user?.showRealName ?? true,
    watchlistPrivacy: user?.watchlistPrivacy || 'friends',
    ratingsPrivacy: user?.ratingsPrivacy || 'friends',
    shareActivity: user?.shareActivity ?? true,
    emailNotifications: user?.emailNotifications ?? false,
    friendRecommendations: user?.friendRecommendations ?? true,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: typeof settings) => {
      await apiRequest('PUT', '/api/users/privacy', newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Settings Updated",
        description: "Your privacy settings have been saved successfully.",
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
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleSwitchChange = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key: 'watchlistPrivacy' | 'ratingsPrivacy', value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Privacy Settings</h1>
        <p className="text-gray-400 mt-2">Control who can see your activity and watchlists</p>
      </div>

      <div className="space-y-6">
        {/* Profile Visibility */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Profile Visibility</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="public-profile" className="font-medium text-white">Public Profile</Label>
                  <p className="text-sm text-gray-400">Allow others to find and view your profile</p>
                </div>
                <Switch
                  id="public-profile"
                  checked={settings.publicProfile}
                  onCheckedChange={(checked) => handleSwitchChange('publicProfile', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-real-name" className="font-medium text-white">Show Real Name</Label>
                  <p className="text-sm text-gray-400">Display your real name on your profile</p>
                </div>
                <Switch
                  id="show-real-name"
                  checked={settings.showRealName}
                  onCheckedChange={(checked) => handleSwitchChange('showRealName', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Watchlist Privacy */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Watchlist Privacy</h2>
            <div className="space-y-4">
              <div>
                <Label className="font-medium text-white mb-2 block">Who can see your watchlist?</Label>
                <RadioGroup 
                  value={settings.watchlistPrivacy} 
                  onValueChange={(value) => handlePrivacyChange('watchlistPrivacy', value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="watchlist-public" />
                    <Label htmlFor="watchlist-public" className="text-gray-300">Everyone</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="friends" id="watchlist-friends" />
                    <Label htmlFor="watchlist-friends" className="text-gray-300">Friends only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="watchlist-private" />
                    <Label htmlFor="watchlist-private" className="text-gray-300">Only me</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label className="font-medium text-white mb-2 block">Who can see your ratings and reviews?</Label>
                <RadioGroup 
                  value={settings.ratingsPrivacy} 
                  onValueChange={(value) => handlePrivacyChange('ratingsPrivacy', value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="ratings-public" />
                    <Label htmlFor="ratings-public" className="text-gray-300">Everyone</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="friends" id="ratings-friends" />
                    <Label htmlFor="ratings-friends" className="text-gray-300">Friends only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="ratings-private" />
                    <Label htmlFor="ratings-private" className="text-gray-300">Only me</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Settings */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Activity Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="share-activity" className="font-medium text-white">Share watching activity</Label>
                  <p className="text-sm text-gray-400">Let friends see what you're currently watching</p>
                </div>
                <Switch
                  id="share-activity"
                  checked={settings.shareActivity}
                  onCheckedChange={(checked) => handleSwitchChange('shareActivity', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications" className="font-medium text-white">Email notifications</Label>
                  <p className="text-sm text-gray-400">Receive updates about friend activity</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSwitchChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="friend-recommendations" className="font-medium text-white">Friend recommendations</Label>
                  <p className="text-sm text-gray-400">Allow us to suggest friends based on your activity</p>
                </div>
                <Switch
                  id="friend-recommendations"
                  checked={settings.friendRecommendations}
                  onCheckedChange={(checked) => handleSwitchChange('friendRecommendations', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Data Management</h2>
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="text-left">
                    <p className="font-medium">Export my data</p>
                    <p className="text-sm text-gray-400">Download all your watchlist and activity data</p>
                  </div>
                  <Download className="w-5 h-5 text-gray-400" />
                </div>
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full bg-red-900 hover:bg-red-800 text-white"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="text-left">
                    <p className="font-medium">Delete my account</p>
                    <p className="text-sm text-red-300">Permanently remove your account and all data</p>
                  </div>
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
