// Re-export shared schema types
export type { 
  User, 
  WatchlistItem, 
  WatchedItem, 
  Activity, 
  Friendship,
  InsertWatchlistItem,
  InsertWatchedItem
} from "@shared/schema";

// Types from legacy system for compatibility
export type MovieRecommendation = {
  title: string;
  year: number;
  summary: string;
  genre: string;
  streamingService: string;
  reason: string;
  contentType: 'Movie' | 'TV Show';
  franchiseMovies?: Array<{ title: string; year: number }>;
};

export type SearchResult = {
  text: string;
  sources: Array<{ uri: string; title: string }>;
};

export type GroundingSource = {
  uri: string;
  title: string;
};

export type FriendGeneratedLists = {
  watchlist: Array<{
    title: string;
    year: number;
    contentType: 'Movie' | 'TV Show';
    genre: string;
    summary: string;
    reason: string;
  }>;
  watchedList: Array<{
    title: string;
    year: number;
    contentType: 'Movie' | 'TV Show';
    genre: string;
    summary: string;
    reason: string;
    rating: number;
  }>;
};

// Stats type for dashboard
export type UserStats = {
  watchlistCount: number;
  watchedCount: number;
  friendsCount: number;
  thisMonthCount: number;
};

// Extended types for API responses
export type FriendRequestWithUser = Friendship & { 
  user: { 
    firstName: string; 
    lastName: string; 
    profileImageUrl: string; 
  } 
};

export type ActivityWithUser = Activity & { 
  user: { 
    firstName: string; 
    lastName: string; 
  } 
};