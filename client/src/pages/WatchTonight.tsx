import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useWatchlist } from "@/components/WatchlistContext";
import { GENRES, MOODS, PLATFORMS } from "@/constants";
import { Wand2, Plus, ExternalLink } from "lucide-react";

interface MovieRecommendation {
  title: string;
  year: number;
  summary: string;
  genre: string;
  streamingService: string;
  reason: string;
  contentType: 'Movie' | 'TV Show';
  franchiseMovies?: Array<{ title: string; year: number }>;
}

export default function WatchTonight() {
  const { toast } = useToast();
  const { addToWatchlist, addToWatched } = useWatchlist();
  
  const [filters, setFilters] = useState({
    genre: 'Any',
    mood: 'Any',
    platforms: [] as string[],
    contentType: 'Movie' as 'Movie' | 'TV Show',
    seriesStatus: 'Any',
  });

  const [recommendation, setRecommendation] = useState<MovieRecommendation | null>(null);

  const getRecommendationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/recommendations', filters);
      return response.json();
    },
    onSuccess: (data: MovieRecommendation) => {
      setRecommendation(data);
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
        description: error.message || "Failed to get recommendation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGetRecommendation = () => {
    getRecommendationMutation.mutate();
  };

  const handleAddToWatchlist = () => {
    if (recommendation) {
      addToWatchlist(recommendation);
      toast({
        title: "Added to Watchlist",
        description: `${recommendation.title} has been added to your watchlist.`,
      });
    }
  };

  const handleAddToWatched = () => {
    if (recommendation) {
      addToWatched(recommendation, null, '');
      toast({
        title: "Added to Watched",
        description: `${recommendation.title} has been marked as watched.`,
      });
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setFilters(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">What to Watch Tonight</h1>
        <p className="text-gray-400 mt-2">Get personalized AI recommendations based on your preferences</p>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Customize Your Recommendation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content Type</label>
              <Select 
                value={filters.contentType} 
                onValueChange={(value: 'Movie' | 'TV Show') => setFilters(prev => ({ ...prev, contentType: value }))}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Movie">Movie</SelectItem>
                  <SelectItem value="TV Show">TV Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
              <Select 
                value={filters.genre} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, genre: value }))}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mood</label>
              <Select 
                value={filters.mood} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, mood: value }))}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOODS.map(mood => (
                    <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filters.contentType === 'TV Show' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Series Status</label>
                <Select 
                  value={filters.seriesStatus} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, seriesStatus: value }))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Any</SelectItem>
                    <SelectItem value="Completed">Completed Series Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Streaming Platforms (optional)</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(platform => (
                <Badge
                  key={platform}
                  variant={filters.platforms.includes(platform) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    filters.platforms.includes(platform) 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => handlePlatformToggle(platform)}
                >
                  {platform}
                </Badge>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleGetRecommendation}
            disabled={getRecommendationMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            size="lg"
          >
            <Wand2 className="w-5 h-5 mr-2" />
            {getRecommendationMutation.isPending ? 'Getting Recommendation...' : 'Get My Recommendation'}
          </Button>
        </CardContent>
      </Card>

      {/* Recommendation Result */}
      {recommendation && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {recommendation.title} ({recommendation.year})
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{recommendation.contentType}</Badge>
                  <Badge variant="outline">{recommendation.genre}</Badge>
                  <Badge className="bg-green-600 text-white">{recommendation.streamingService}</Badge>
                </div>
              </div>
            </div>

            <p className="text-gray-300 mb-4 leading-relaxed">{recommendation.summary}</p>

            <div className="bg-gray-900/70 p-4 rounded-lg mb-4">
              <p className="text-indigo-200">
                <span className="font-semibold">✨ Why this is perfect for you:</span> {recommendation.reason}
              </p>
            </div>

            {recommendation.franchiseMovies && recommendation.franchiseMovies.length > 0 && (
              <div className="bg-gray-700 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-white mb-2">🎬 Other movies in this franchise:</h3>
                <div className="flex flex-wrap gap-2">
                  {recommendation.franchiseMovies.map((movie, index) => (
                    <Badge key={index} variant="outline" className="text-gray-300">
                      {movie.title} ({movie.year})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mt-6">
              <Button onClick={handleAddToWatchlist} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Add to Watchlist
              </Button>
              <Button onClick={handleAddToWatched} variant="outline">
                Mark as Watched
              </Button>
              <div className="flex items-center gap-2 ml-auto">
                <a
                  href={`https://www.imdb.com/find?q=${encodeURIComponent(`${recommendation.title} ${recommendation.year}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-3 rounded text-sm transition-colors"
                >
                  IMDb <ExternalLink className="w-3 h-3 ml-1" />
                </a>
                <a
                  href={`https://www.rottentomatoes.com/search?search=${encodeURIComponent(recommendation.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm transition-colors"
                >
                  RT <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
