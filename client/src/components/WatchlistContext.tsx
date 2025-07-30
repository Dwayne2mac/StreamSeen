import React, { createContext, useContext, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import type { WatchlistItem, WatchedItem, MovieRecommendation } from '@/types';

interface WatchlistContextType {
  watchlist: WatchlistItem[];
  watchedList: WatchedItem[];
  isLoading: boolean;
  addToWatchlist: (movie: MovieRecommendation) => void;
  removeFromWatchlist: (title: string, year: number) => void;
  moveToWatched: (item: WatchlistItem, rating: number | null, comment: string) => void;
  addToWatched: (movie: MovieRecommendation, rating: number | null, comment: string) => void;
  removeFromWatched: (title: string, year: number) => void;
  updateWatchedItem: (title: string, year: number, rating: number | null, comment: string) => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: watchlist = [], isLoading: watchlistLoading } = useQuery<WatchlistItem[]>({
    queryKey: ['/api/watchlist'],
  });

  const { data: watchedList = [], isLoading: watchedLoading } = useQuery<WatchedItem[]>({
    queryKey: ['/api/watched'],
  });

  const isLoading = watchlistLoading || watchedLoading;

  const addToWatchlistMutation = useMutation({
    mutationFn: async (movie: MovieRecommendation) => {
      await apiRequest('POST', '/api/watchlist', movie);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/stats'] });
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
        description: error.message || "Failed to add to watchlist",
        variant: "destructive",
      });
    },
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async ({ title, year }: { title: string; year: number }) => {
      await apiRequest('DELETE', `/api/watchlist/${encodeURIComponent(title)}/${year}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/stats'] });
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
        description: "Failed to remove from watchlist",
        variant: "destructive",
      });
    },
  });

  const addToWatchedMutation = useMutation({
    mutationFn: async (item: MovieRecommendation & { rating: number | null; comment: string }) => {
      await apiRequest('POST', '/api/watched', {
        ...item,
        watchedDate: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watched'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/stats'] });
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
        description: error.message || "Failed to add to watched list",
        variant: "destructive",
      });
    },
  });

  const removeFromWatchedMutation = useMutation({
    mutationFn: async ({ title, year }: { title: string; year: number }) => {
      await apiRequest('DELETE', `/api/watched/${encodeURIComponent(title)}/${year}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watched'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/stats'] });
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
        description: "Failed to remove from watched list",
        variant: "destructive",
      });
    },
  });

  const updateWatchedMutation = useMutation({
    mutationFn: async ({ title, year, rating, comment }: { title: string; year: number; rating: number | null; comment: string }) => {
      await apiRequest('PUT', `/api/watched/${encodeURIComponent(title)}/${year}`, { rating, comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watched'] });
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
        description: "Failed to update watched item",
        variant: "destructive",
      });
    },
  });

  const moveToWatchedMutation = useMutation({
    mutationFn: async ({ title, year, rating, comment }: { title: string; year: number; rating: number | null; comment: string }) => {
      await apiRequest('POST', '/api/watched/move', { title, year, rating, comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['/api/watched'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/stats'] });
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
        description: "Failed to move to watched",
        variant: "destructive",
      });
    },
  });

  const addToWatchlist = (movie: MovieRecommendation) => {
    const cleanedMovie = { ...movie, title: movie.title.trim() };
    const titleToCompare = cleanedMovie.title.toLowerCase();

    const inWatchlist = watchlist.some((item: WatchlistItem) => item.title.trim().toLowerCase() === titleToCompare && item.year === cleanedMovie.year);
    const inWatchedList = watchedList.some((item: WatchedItem) => item.title.trim().toLowerCase() === titleToCompare && item.year === cleanedMovie.year);
    
    if (!inWatchlist && !inWatchedList) {
      addToWatchlistMutation.mutate(cleanedMovie);
    } else {
      toast({
        title: "Already exists",
        description: "This item is already in your watchlist or watched list.",
        variant: "destructive",
      });
    }
  };

  const addToWatched = (movie: MovieRecommendation, rating: number | null, comment: string) => {
    const cleanedMovie = { ...movie, title: movie.title.trim() };
    const titleToCompare = cleanedMovie.title.toLowerCase();

    const inWatchlist = watchlist.some((item: WatchlistItem) => item.title.trim().toLowerCase() === titleToCompare && item.year === cleanedMovie.year);
    const inWatchedList = watchedList.some((item: WatchedItem) => item.title.trim().toLowerCase() === titleToCompare && item.year === cleanedMovie.year);

    if (!inWatchlist && !inWatchedList) {
      addToWatchedMutation.mutate({ ...cleanedMovie, rating, comment });
    } else {
      toast({
        title: "Already exists",
        description: "This item is already in your watchlist or watched list.",
        variant: "destructive",
      });
    }
  };

  const removeFromWatchlist = (title: string, year: number) => {
    removeFromWatchlistMutation.mutate({ title, year });
  };

  const moveToWatched = (item: WatchlistItem, rating: number | null, comment: string) => {
    const cleanedItem = { ...item, title: item.title.trim() };
    const titleToCompare = cleanedItem.title.toLowerCase();
    
    // Check if it already exists in watched list
    if (watchedList.some((watched: WatchedItem) => watched.title.trim().toLowerCase() === titleToCompare && watched.year === cleanedItem.year)) {
      removeFromWatchlist(cleanedItem.title, cleanedItem.year);
      return;
    }
    
    moveToWatchedMutation.mutate({ 
      title: cleanedItem.title, 
      year: cleanedItem.year, 
      rating, 
      comment 
    });
  };

  const removeFromWatched = (title: string, year: number) => {
    removeFromWatchedMutation.mutate({ title, year });
  };

  const updateWatchedItem = (title: string, year: number, rating: number | null, comment: string) => {
    updateWatchedMutation.mutate({ title, year, rating, comment });
  };

  return (
    <WatchlistContext.Provider value={{
      watchlist,
      watchedList,
      isLoading,
      addToWatchlist,
      removeFromWatchlist,
      moveToWatched,
      addToWatched,
      removeFromWatched,
      updateWatchedItem,
    }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = (): WatchlistContextType => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
