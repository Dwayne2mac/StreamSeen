import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { getMovieRecommendation } from '../services/geminiService';
import { MovieRecommendation, FranchiseMovie } from '../types';
import { GENRES, MOODS, PLATFORMS } from '../constants';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { useWatchlist } from '../context/WatchlistContext';
import StarRating from './common/StarRating';
import FranchiseMovieItem from './common/FranchiseMovieItem';

const FilterToggle: React.FC<{
  label: string;
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
}> = ({ label, options, selectedValue, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <div className="flex items-center space-x-2 bg-gray-700 p-1 rounded-lg">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`w-full py-2 px-3 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 ${
            selectedValue === option.value ? 'bg-indigo-600 text-white' : 'bg-transparent text-gray-300 hover:bg-gray-600'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

const WatchTonight: React.FC = () => {
  const [contentType, setContentType] = useState<'Movie' | 'TV Show'>('Movie');
  const [seriesStatus, setSeriesStatus] = useState<'Any' | 'Completed'>('Any');
  const [genre, setGenre] = useState<string>(GENRES[0]);
  const [mood, setMood] = useState<string>(MOODS[0]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [recommendation, setRecommendation] = useState<MovieRecommendation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addToWatchlist, watchlist, watchedList, addToWatched } = useWatchlist();
  
  const [showWatchedForm, setShowWatchedForm] = useState(false);
  const [rating, setRating] = useState<number|null>(null);
  const [comment, setComment] = useState("");

  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const platformDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (platformDropdownRef.current && !platformDropdownRef.current.contains(event.target as Node)) {
            setIsPlatformDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const excludedTitles = useMemo(() => {
    const watchlistTitles = watchlist.map(item => item.title);
    const watchedListTitles = watchedList.map(item => item.title);
    return [...new Set([...watchlistTitles, ...watchedListTitles])];
  }, [watchlist, watchedList]);

  const handlePlatformToggle = useCallback((platform: string) => {
    setSelectedPlatforms(prev => {
        const newSet = new Set(prev);
        if (newSet.has(platform)) {
            newSet.delete(platform);
        } else {
            newSet.add(platform);
        }
        return newSet;
    });
  }, []);

  const handleRecommend = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRecommendation(null);
    setShowWatchedForm(false);
    try {
      const result = await getMovieRecommendation(genre, mood, Array.from(selectedPlatforms), excludedTitles, contentType, seriesStatus);
      setRecommendation(result);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, [genre, mood, selectedPlatforms, excludedTitles, contentType, seriesStatus]);
  
  const isAlreadyInLists = useMemo(() => {
    if (!recommendation) return false;
    const titleToCompare = recommendation.title.trim().toLowerCase();
    const inWatchlist = watchlist.some(item => item.title.trim().toLowerCase() === titleToCompare && item.year === recommendation.year);
    const inWatchedList = watchedList.some(item => item.title.trim().toLowerCase() === titleToCompare && item.year === recommendation.year);
    return inWatchlist || inWatchedList;
  }, [recommendation, watchlist, watchedList]);

  const allFranchiseMoviesInLists = useMemo(() => {
    if (!recommendation?.franchiseMovies) return true;
    return recommendation.franchiseMovies.every(franchiseMovie => {
        const titleToCompare = franchiseMovie.title.trim().toLowerCase();
        return watchlist.some(item => item.title.trim().toLowerCase() === titleToCompare && item.year === franchiseMovie.year) ||
               watchedList.some(item => item.title.trim().toLowerCase() === titleToCompare && item.year === franchiseMovie.year);
    });
  }, [recommendation, watchlist, watchedList]);

  const handleAddAllFranchiseMovies = () => {
    if (!recommendation?.franchiseMovies) return;

    recommendation.franchiseMovies.forEach(movie => {
        const titleToCompare = movie.title.trim().toLowerCase();
        const inWatchlist = watchlist.some(item => item.title.trim().toLowerCase() === titleToCompare && item.year === movie.year);
        const inWatchedList = watchedList.some(item => item.title.trim().toLowerCase() === titleToCompare && item.year === movie.year);
        
        if (!inWatchlist && !inWatchedList) {
             const recommendationFromFranchise: MovieRecommendation = {
                title: movie.title,
                year: movie.year,
                contentType: 'Movie',
                summary: `Part of the same franchise as ${recommendation.title}.`,
                genre: recommendation.genre,
                streamingService: 'Unknown',
                reason: `Part of the ${recommendation.title} franchise.`,
            };
            addToWatchlist(recommendationFromFranchise);
        }
    });
  };

  const handleAddToWatchlist = () => {
    if (!recommendation) return;
    addToWatchlist(recommendation);
    setRecommendation(null);
  }

  const handleSaveToWatched = () => {
    if (!recommendation) return;
    addToWatched(recommendation, rating, comment);
    setRecommendation(null);
    setShowWatchedForm(false);
    setRating(null);
    setComment("");
  }


  const FilterSelect: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[]}> = ({label, value, onChange, options}) => (
     <div>
        <label htmlFor={label.toLowerCase()} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <select
          id={label.toLowerCase()}
          value={value}
          onChange={onChange}
          className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
        >
          {options.map(opt => <option key={opt}>{opt}</option>)}
        </select>
      </div>
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">What Should I Watch Tonight?</h2>
        <p className="text-gray-400 mt-1">End the scrolling. Get one perfect recommendation.</p>
      </div>
      
      <FilterToggle
        label="Content Type"
        options={[{value: 'Movie', label: 'Movies'}, {value: 'TV Show', label: 'TV Shows'}]}
        selectedValue={contentType}
        onChange={(val) => setContentType(val as 'Movie' | 'TV Show')}
      />

      {contentType === 'TV Show' && (
          <div className="animate-fade-in">
              <FilterToggle
                  label="Series Status"
                  options={[{value: 'Any', label: 'Any'}, {value: 'Completed', label: 'Completed & Bingeable'}]}
                  selectedValue={seriesStatus}
                  onChange={(val) => setSeriesStatus(val as 'Any' | 'Completed')}
              />
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <FilterSelect label="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} options={GENRES} />
        <FilterSelect label="Mood" value={mood} onChange={(e) => setMood(e.target.value)} options={MOODS} />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Platforms</label>
        <div className="relative" ref={platformDropdownRef}>
            <button
                type="button"
                onClick={() => setIsPlatformDropdownOpen(!isPlatformDropdownOpen)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2.5 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white flex justify-between items-center"
                aria-haspopup="listbox"
                aria-expanded={isPlatformDropdownOpen}
            >
                <span>Select Platforms ({selectedPlatforms.size})</span>
                <svg className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isPlatformDropdownOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>

            {isPlatformDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-gray-800 shadow-lg rounded-md border border-gray-700">
                    <ul className="max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        {PLATFORMS.map((platform) => (
                            <li key={platform} className="text-gray-300 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-gray-700">
                                <label htmlFor={`dropdown-platform-${platform}`} className="flex items-center cursor-pointer w-full">
                                    <input
                                        id={`dropdown-platform-${platform}`}
                                        type="checkbox"
                                        checked={selectedPlatforms.has(platform)}
                                        onChange={() => handlePlatformToggle(platform)}
                                        className="h-4 w-4 rounded text-indigo-600 bg-gray-900 border-gray-600 focus:ring-indigo-500 focus:ring-offset-gray-800"
                                    />
                                    <span className="ml-3 block font-normal text-white">{platform}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
      </div>
      
      {selectedPlatforms.size > 0 && (
        <div className="mb-6 animate-fade-in">
            <h3 className="block text-sm font-medium text-gray-300 mb-2">Platforms Selected</h3>
            <div className="flex flex-wrap gap-2">
                {Array.from(selectedPlatforms).map((platform) => (
                    <span key={platform} className="flex items-center gap-x-1.5 bg-indigo-900/60 text-indigo-200 text-sm font-medium px-2.5 py-1 rounded-full">
                        {platform}
                        <button
                            type="button"
                            onClick={() => handlePlatformToggle(platform)}
                            className="flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200/20 hover:text-indigo-300 focus:outline-none focus:bg-indigo-500 focus:text-white"
                            aria-label={`Remove ${platform}`}
                        >
                            <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                            </svg>
                        </button>
                    </span>
                ))}
            </div>
        </div>
      )}


      <button
        onClick={handleRecommend}
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
      >
        {loading ? 'Finding a gem...' : `Find My ${contentType === 'Movie' ? 'Movie' : 'TV Show'}`}
      </button>

      <div className="mt-8 min-h-[200px]">
        {loading && <Spinner />}
        {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
        {recommendation && (
          <div className="bg-gray-900/50 rounded-lg p-6 animate-fade-in">
            <h3 className="text-2xl font-bold text-indigo-300">{recommendation.title} <span className="text-lg font-normal text-gray-400">({recommendation.year})</span></h3>
            <p className="text-sm font-medium text-gray-400 mt-1 mb-3">Available on <span className="font-bold text-gray-300">{recommendation.streamingService}</span></p>
            <p className="text-gray-300 mb-4">{recommendation.summary}</p>
            <div className="bg-gray-800 p-3 rounded-md mb-4">
              <p className="text-sm text-indigo-200">✨ <span className="font-semibold">Why you'll like it:</span> {recommendation.reason}</p>
            </div>
            
            {showWatchedForm ? (
                 <div className="mt-4 pt-4 border-t border-gray-700 space-y-3 animate-fade-in">
                    <h5 className="text-md font-semibold text-indigo-300">Log this {contentType === 'Movie' ? 'movie' : 'show'}</h5>
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
                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-2">
                       <a
                          href={`https://www.imdb.com/find?q=${encodeURIComponent(`${recommendation.title} ${recommendation.year}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-3 rounded-lg text-sm transition-colors duration-200"
                          aria-label={`Find ${recommendation.title} on IMDb`}
                      >
                          IMDb
                      </a>
                      <a
                          href={`https://www.rottentomatoes.com/search?search=${encodeURIComponent(recommendation.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors duration-200"
                          aria-label={`Find ${recommendation.title} on Rotten Tomatoes`}
                      >
                          Rotten Tomatoes
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                          onClick={handleAddToWatchlist}
                          disabled={isAlreadyInLists}
                          className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 text-sm whitespace-nowrap"
                        >
                          {isAlreadyInLists ? 'In Your Lists' : 'Add to Watchlist'}
                        </button>
                         <button
                          onClick={() => setShowWatchedForm(true)}
                          disabled={isAlreadyInLists}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 text-sm whitespace-nowrap"
                        >
                          Mark as Watched
                        </button>
                    </div>
                </div>
            )}
            {recommendation.franchiseMovies && recommendation.franchiseMovies.length > 0 && (
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
                  {recommendation.franchiseMovies.map(movie => (
                    <FranchiseMovieItem key={`${movie.title}-${movie.year}`} movie={movie} sourceTitle={recommendation.title} sourceGenre={recommendation.genre} />
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

export default WatchTonight;
