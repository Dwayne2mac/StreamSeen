export enum AppView {
  WATCH_TONIGHT,
  IS_IT_ON_STREAMING,
  WATCHLIST,
  FRIENDS,
}

export interface FranchiseMovie {
  title: string;
  year: number;
}

export interface MovieRecommendation {
  title: string;
  year: number;
  summary: string;
  genre: string;
  streamingService: string;
  reason: string;
  contentType: 'Movie' | 'TV Show';
  franchiseMovies?: FranchiseMovie[];
}

export interface SearchResult {
  text: string;
  sources: GroundingSource[];
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface WatchlistItem extends MovieRecommendation {}

export interface WatchedItem extends MovieRecommendation {
  rating: number | null;
  comment: string;
  watchedDate: string;
}

export interface Friend {
  id: string;
  name: string;
}

export interface FriendWatchlistItem {
  title: string;
  year: number;
  contentType: 'Movie' | 'TV Show';
  genre: string;
  summary: string;
  reason: string;
}

export interface FriendWatchedItem extends FriendWatchlistItem {
  rating: number;
}

export interface FriendGeneratedLists {
    watchlist: FriendWatchlistItem[];
    watchedList: FriendWatchedItem[];
}