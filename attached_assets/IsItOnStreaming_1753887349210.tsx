import React, { useState, useCallback, useMemo } from 'react';
import { findStreamingServices, getStructuredInfoForTitle } from '../services/geminiService';
import { SearchResult, MovieRecommendation, FranchiseMovie } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { useWatchlist } from '../context/WatchlistContext';
import StarRating from './common/StarRating';
import FranchiseMovieItem from './common/FranchiseMovieItem';

const IsItOnStreaming: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [searchTitle, setSearchTitle] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const { addToWatchlist, addToWatched, watchlist, watchedList } = useWatchlist();
  const [structuredInfo, setStructuredInfo] = useState<Omit<MovieRecommendation, 'streamingService' | 'reason'> | null>(null);
  const [showWatchedForm, setShowWatchedForm] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  const handleSearch = useCallback(async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setStructuredInfo(null);
    setShowWatchedForm(false);
    setRating(null);
    setComment("");
    setFeedbackMessage(''); // Reset feedback on new search
    setSearchTitle(trimmedQuery);
    
    try {
      const searchResult = await findStreamingServices(trimmedQuery);
      setResult(searchResult);

      try {
        const info = await getStructuredInfoForTitle(trimmedQuery);
        setStructuredInfo(info);
      } catch (infoError) {
        console.warn("Could not get structured info for adding to lists:", infoError);
        setStructuredInfo(null);
      }

    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const isAlreadyInLists = useMemo(() => {
    if (!structuredInfo) return false;
    const titleToCompare = structuredInfo.title.trim().toLowerCase();
    const inWatchlist = watchlist.some(item => item.title.trim().toLowerCase() === titleToCompare && item.year === structuredInfo.year);
    const inWatchedList = watchedList.some(item => item.title.trim().toLowerCase() === titleToCompare && item.year === structuredInfo.year);
    return inWatchlist || inWatchedList;
  }, [structuredInfo, watchlist, watchedList]);
  
  const allFranchiseMoviesInLists = useMemo(() => {
    if (!structuredInfo?.franchiseMovies) return true;
    return structuredInfo.franchiseMovies.every(franchiseMovie => {
        const titleToCompare = franchiseMovie.title.trim().toLowerCase();
        return watchlist.some(item => item.title.trim().toLowerCase() === titleToCompare && item.year === franchiseMovie.year) ||
               watchedList.some(item => item.title.trim().toLowerCase() === titleToCompare && item.year === franchiseMovie.year);
    });
  }, [structuredInfo, watchlist, watchedList]);

  const handleAddAllFranchiseMovies = () => {
    if (!structuredInfo?.franchiseMovies) return;

    structuredInfo.franchiseMovies.forEach(movie => {
        const titleToCompare = movie.title.trim().toLowerCase();
        const inWatchlist = watchlist.some(item => item.title.trim().toLowerCase() === titleToCompare && item.year === movie.year);
        const inWatchedList = watchedList.some(item => item.title.trim().toLowerCase() === titleToCompare && item.year === movie.year);
        
        if (!inWatchlist && !inWatchedList) {
             const recommendationFromFranchise: MovieRecommendation = {
                title: movie.title,
                year: movie.year,
                contentType: 'Movie',
                summary: `Part of the same franchise as ${structuredInfo.title}.`,
                genre: structuredInfo.genre,
                streamingService: 'Unknown',
                reason: `Part of the ${structuredInfo.title} franchise.`,
            };
            addToWatchlist(recommendationFromFranchise);
        }
    });
  };

  const handleAddToWatchlist = () => {
    if (!structuredInfo) return;
    const newItem: MovieRecommendation = {
      ...structuredInfo,
      streamingService: 'See search results',
      reason: 'Added from search result.'
    };
    addToWatchlist(newItem);
    setFeedbackMessage('Added to your watchlist!');
  };

  const handleSaveToWatched = () => {
    if (!structuredInfo) return;
    const newItem: MovieRecommendation = {
      ...structuredInfo,
      streamingService: 'See search results',
      reason: 'Added from search result.'
    };
    addToWatched(newItem, rating, comment);
    setShowWatchedForm(false);
    setFeedbackMessage('Saved to your watched list!');
  };


  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Is It On Streaming?</h2>
        <p className="text-gray-400 mt-1">Search for any movie or show to see where it's available.</p>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., The Matrix"
          className="flex-grow px-4 py-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-5 rounded-lg transition-colors duration-200"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>

      <div className="mt-8 min-h-[200px]">
        {loading && <Spinner />}
        {error && !result && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
        {result && (
          <div className="bg-gray-900/50 rounded-lg p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-white mb-4">Streaming Info for "{searchTitle}"</h3>
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">{result.text}</div>
            
            {result.sources && result.sources.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Sources:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        {result.sources.map((source, index) => (
                            <li key={index}>
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">
                                    {source.title || 'Source Link'}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
             {structuredInfo && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                {feedbackMessage ? (
                   <p className="text-center text-green-400 font-semibold bg-green-900/50 p-3 rounded-lg">
                    {feedbackMessage}
                  </p>
                ) : isAlreadyInLists ? (
                  <p className="text-center text-green-400 font-semibold bg-green-900/50 p-3 rounded-lg">
                    This item is already in your lists.
                  </p>
                ) : showWatchedForm ? (
                  <div className="space-y-3 animate-fade-in">
                    <h5 className="text-md font-semibold text-indigo-300">Log this {structuredInfo.contentType?.toLowerCase() || 'item'}</h5>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Your Rating</label>
                      <StarRating rating={rating} setRating={setRating} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Comments (optional)</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full h-20 p-2 bg-gray-700 border border-gray-600 rounded-md text-white sm:text-sm"
                        placeholder="What did you think?"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setShowWatchedForm(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-3 rounded-md text-sm">Cancel</button>
                      <button onClick={handleSaveToWatched} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded-md text-sm">Save to Watched</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={handleAddToWatchlist}
                      className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm whitespace-nowrap"
                    >
                      Add to Watchlist
                    </button>
                    <button
                      onClick={() => setShowWatchedForm(true)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm whitespace-nowrap"
                    >
                      Mark as Watched
                    </button>
                  </div>
                )}
              </div>
            )}
            {structuredInfo?.franchiseMovies && structuredInfo.franchiseMovies.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-700 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-indigo-300">Complete the Franchise</h4>
                  <button 
                    onClick={handleAddAllFranchiseMovies}
                    disabled={allFranchiseMoviesInLists}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-1 px-3 rounded-md text-sm"
                  >
                    {allFranchiseMoviesInLists ? 'All In Lists' : 'Add All to Watchlist'}
                  </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {structuredInfo.franchiseMovies.map(movie => (
                    <FranchiseMovieItem key={`${movie.title}-${movie.year}`} movie={movie} sourceTitle={structuredInfo.title} sourceGenre={structuredInfo.genre} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default IsItOnStreaming;