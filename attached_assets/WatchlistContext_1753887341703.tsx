import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WatchlistItem, WatchedItem, MovieRecommendation } from '../types';

interface WatchlistContextType {
  watchlist: WatchlistItem[];
  watchedList: WatchedItem[];
  addToWatchlist: (movie: MovieRecommendation) => void;
  removeFromWatchlist: (title: string, year: number) => void;
  moveToWatched: (item: WatchlistItem, rating: number | null, comment: string) => void;
  addToWatched: (movie: MovieRecommendation, rating: number | null, comment: string) => void;
  removeFromWatched: (title:string, year: number) => void;
  updateWatchedItem: (title: string, year: number, rating: number | null, comment: string) => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
        const localData = localStorage.getItem('watchlist');
        return localData ? JSON.parse(localData) : [];
    } catch (error) {
        return [];
    }
  });

  const [watchedList, setWatchedList] = useState<WatchedItem[]>(() => {
     try {
        const localData = localStorage.getItem('watchedList');
        return localData ? JSON.parse(localData) : [];
    } catch (error) {
        return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('watchedList', JSON.stringify(watchedList));
  }, [watchedList]);

  const addToWatchlist = (movie: MovieRecommendation) => {
    const cleanedMovie = { ...movie, title: movie.title.trim() };
    const titleToCompare = cleanedMovie.title.toLowerCase();

    const inWatchlist = watchlist.some(item => item.title.trim().toLowerCase() === titleToCompare && item.year === cleanedMovie.year);
    const inWatchedList = watchedList.some(item => item.title.trim().toLowerCase() === titleToCompare && item.year === cleanedMovie.year);
    
    if (!inWatchlist && !inWatchedList) {
      setWatchlist(prev => [...prev, cleanedMovie]);
    }
  };
  
  const addToWatched = (movie: MovieRecommendation, rating: number | null, comment: string) => {
    const cleanedMovie = { ...movie, title: movie.title.trim() };
    const titleToCompare = cleanedMovie.title.toLowerCase();

    const inWatchlist = watchlist.some(item => item.title.trim().toLowerCase() === titleToCompare && item.year === cleanedMovie.year);
    const inWatchedList = watchedList.some(item => item.title.trim().toLowerCase() === titleToCompare && item.year === cleanedMovie.year);

    if (!inWatchlist && !inWatchedList) {
      const newWatchedItem: WatchedItem = {
        ...cleanedMovie,
        rating,
        comment,
        watchedDate: new Date().toISOString(),
      };
      setWatchedList(prev => [newWatchedItem, ...prev]);
    }
  };

  const removeFromWatchlist = (title: string, year: number) => {
    const titleToCompare = title.trim().toLowerCase();
    setWatchlist(prev => prev.filter(item => !(item.title.trim().toLowerCase() === titleToCompare && item.year === year)));
  };

  const moveToWatched = (item: WatchlistItem, rating: number | null, comment: string) => {
    const cleanedItem = { ...item, title: item.title.trim() };
    const titleToCompare = cleanedItem.title.toLowerCase();
    
    // Prevent creating a duplicate if it somehow already exists in watched list
    if (watchedList.some(watched => watched.title.trim().toLowerCase() === titleToCompare && watched.year === cleanedItem.year)) {
        removeFromWatchlist(cleanedItem.title, cleanedItem.year);
        return;
    }
    
    const newWatchedItem: WatchedItem = {
      ...cleanedItem,
      rating,
      comment,
      watchedDate: new Date().toISOString(),
    };

    setWatchedList(prev => [newWatchedItem, ...prev]);
    removeFromWatchlist(cleanedItem.title, cleanedItem.year);
  };
  
  const removeFromWatched = (title: string, year: number) => {
      const titleToCompare = title.trim().toLowerCase();
      setWatchedList(prev => prev.filter(item => !(item.title.trim().toLowerCase() === titleToCompare && item.year === year)));
  };

  const updateWatchedItem = (title: string, year: number, rating: number | null, comment: string) => {
      const titleToCompare = title.trim().toLowerCase();
      setWatchedList(prev => prev.map(item =>
          (item.title.trim().toLowerCase() === titleToCompare && item.year === year) ? { ...item, rating, comment } : item
      ));
  };


  return (
    <WatchlistContext.Provider value={{
      watchlist,
      watchedList,
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
