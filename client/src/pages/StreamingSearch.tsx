import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Search, ExternalLink } from "lucide-react";

interface SearchResult {
  text: string;
  sources: Array<{
    uri: string;
    title: string;
  }>;
}

export default function StreamingSearch() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);

  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const response = await apiRequest('POST', '/api/streaming-search', { query: searchQuery });
      return response.json();
    },
    onSuccess: (data: SearchResult) => {
      setResult(data);
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
        description: error.message || "Failed to search. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      searchMutation.mutate(query.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Streaming Search</h1>
        <p className="text-gray-400 mt-2">Find where any movie or TV show is streaming in the UK</p>
      </div>

      {/* Search Form */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for any movie or TV show..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-lg py-6"
              />
            </div>
            <Button 
              type="submit" 
              disabled={searchMutation.isPending || !query.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              size="lg"
            >
              <Search className="w-5 h-5 mr-2" />
              {searchMutation.isPending ? 'Searching...' : 'Find Streaming Options'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {result && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Streaming Information</h2>
            
            <div className="prose prose-invert max-w-none mb-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">
                  {result.text}
                </div>
              </div>
            </div>

            {result.sources && result.sources.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Sources</h3>
                <div className="space-y-2">
                  {result.sources.map((source, index) => (
                    <a
                      key={index}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                    >
                      <span className="text-gray-200 group-hover:text-white truncate">
                        {source.title}
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white flex-shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Popular Searches Suggestions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Popular Searches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'The Matrix',
              'Stranger Things',
              'The Crown',
              'Avatar: The Way of Water',
              'House of the Dragon',
              'Top Gun: Maverick',
              'The Bear',
              'Wednesday',
            ].map((suggestion) => (
              <Button
                key={suggestion}
                variant="ghost"
                className="text-left justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => {
                  setQuery(suggestion);
                  searchMutation.mutate(suggestion);
                }}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
