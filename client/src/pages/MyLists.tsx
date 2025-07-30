import { useState } from 'react';
import { useWatchlist } from '@/components/WatchlistContext';
import type { WatchedItem, WatchlistItem } from '@/types';
import Card from '@/components/common/Card';
import StarRating from '@/components/common/StarRating';
import GenreGroup from '@/components/common/GenreGroup';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink } from 'lucide-react';

const EditWatchedItem: React.FC<{
  item: WatchedItem;
  onSave: (rating: number | null, comment: string) => void;
  onCancel: () => void;
}> = ({ item, onSave, onCancel }) => {
    const [rating, setRating] = useState<number | null>(item.rating);
    const [comment, setComment] = useState<string>(item.comment);

    return (
        <div className="bg-gray-700 p-4 rounded-lg mt-2 space-y-3 animate-fade-in">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Your Rating</label>
                <StarRating rating={rating} setRating={setRating} />
            </div>
            <div>
                 <label className="block text-sm font-medium text-gray-300 mb-1">Your Comments</label>
                 <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full h-24 p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                    placeholder="Why did you like or dislike it?"
                 />
            </div>
            <div className="flex justify-end gap-2">
                <Button onClick={onCancel} variant="secondary" size="sm">Cancel</Button>
                <Button onClick={() => onSave(rating, comment)} size="sm">Save</Button>
            </div>
        </div>
    )
}

const WatchedItemCard: React.FC<{ item: WatchedItem }> = ({ item }) => {
    const { removeFromWatched, updateWatchedItem } = useWatchlist();
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = (rating: number | null, comment: string) => {
        updateWatchedItem(item.title, item.year, rating, comment);
        setIsEditing(false);
    }
    
    return (
         <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-lg text-white">{item.title} <span className="font-normal text-gray-400">({item.year})</span></h4>
                    <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={item.rating} setRating={() => setIsEditing(true)} size="sm" readOnly={isEditing} />
                        {item.rating && <span className="text-xs text-gray-400">({item.rating}/5)</span>}
                    </div>
                </div>
                <div className="flex gap-2">
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       onClick={() => setIsEditing(!isEditing)}
                       className="text-sm text-indigo-400 hover:text-indigo-300"
                     >
                       {isEditing ? 'Close' : 'Edit'}
                     </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeFromWatched(item.title, item.year)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Remove
                    </Button>
                </div>
            </div>
            {item.comment && !isEditing && <p className="text-gray-300 mt-2 pl-1 border-l-2 border-gray-700 italic text-sm">"{item.comment}"</p>}
            {isEditing && <EditWatchedItem item={item} onSave={handleSave} onCancel={() => setIsEditing(false)} />}
        </div>
    )
}

const WatchlistItemCard: React.FC<{ item: WatchlistItem }> = ({ item }) => {
  const { removeFromWatchlist, moveToWatched } = useWatchlist();
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState<number|null>(null);
  const [comment, setComment] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMove = () => {
    moveToWatched(item, rating, comment);
    setShowRatingForm(false);
    setRating(null);
    setComment("");
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-start gap-4">
            <div>
                <h4 className="font-bold text-lg text-white">{item.title} <span className="font-normal text-gray-400">({item.year})</span></h4>
                <p className="text-sm text-gray-400">On: {item.streamingService}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  {isExpanded ? 'Hide' : 'Details'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeFromWatchlist(item.title, item.year)}
                  className="text-sm text-gray-400 hover:text-red-400 font-medium"
                >
                  Remove
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setShowRatingForm(true)}
                  className="text-sm bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  Watched
                </Button>
            </div>
        </div>

        {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-700 animate-fade-in space-y-3">
                <p className="text-gray-300 mb-3 text-sm">{item.summary}</p>
                <div className="bg-gray-900/70 p-3 rounded-md mb-2">
                    <p className="text-sm text-indigo-200">✨ <span className="font-semibold">Why it was recommended:</span> {item.reason}</p>
                </div>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400">View on:</span>
                    <a
                        href={`https://www.imdb.com/find?q=${encodeURIComponent(`${item.title} ${item.year}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-1 px-2 rounded-md text-xs transition-colors duration-200"
                        aria-label={`Find ${item.title} on IMDb`}
                    >
                        IMDb <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                    <a
                        href={`https://www.rottentomatoes.com/search?search=${encodeURIComponent(item.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-md text-xs transition-colors duration-200"
                        aria-label={`Find ${item.title} on Rotten Tomatoes`}
                    >
                        RT <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                </div>
            </div>
        )}

        {showRatingForm && (
            <div className="mt-4 pt-4 border-t border-gray-700 space-y-3 animate-fade-in">
                <h5 className="text-md font-semibold text-indigo-300">Rate this {item.contentType?.toLowerCase() || 'item'}</h5>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Your Rating</label>
                    <StarRating rating={rating} setRating={setRating} />
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-300 mb-1">Comments (optional)</label>
                     <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full h-20 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        placeholder="What did you think?"
                     />
                </div>
                <div className="flex justify-end gap-2">
                    <Button onClick={() => setShowRatingForm(false)} variant="secondary">Cancel</Button>
                    <Button onClick={handleMove}>Add to Watched</Button>
                </div>
            </div>
        )}
    </div>
  )
}

export default function MyLists() {
  const { watchlist, watchedList, isLoading } = useWatchlist();
  const [listType, setListType] = useState<'Movies' | 'TV Shows'>('Movies');
  
  const contentTypeFilter = listType === 'Movies' ? 'Movie' : 'TV Show';

  const groupItemsByGenre = <T extends { genre?: string }>(items: T[]): Record<string, T[]> => {
      return items.reduce((acc, item) => {
          const genre = item.genre || 'Uncategorized';
          if (!acc[genre]) {
              acc[genre] = [];
          }
          acc[genre].push(item);
          return acc;
      }, {} as Record<string, T[]>);
  };

  const filteredWatchlist = watchlist.filter(item => (item.contentType || 'Movie') === contentTypeFilter);
  const filteredWatchedList = watchedList.filter(item => (item.contentType || 'Movie') === contentTypeFilter);

  const groupedWatchlist = groupItemsByGenre(filteredWatchlist);
  const groupedWatchedList = groupItemsByGenre(filteredWatchedList);

  const ListTypeToggle = () => (
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2 bg-gray-800 border border-gray-700 p-1 rounded-lg">
          <Button
            variant={listType === 'Movies' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setListType('Movies')}
            className={listType === 'Movies' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600'}
          >
            Movies
          </Button>
          <Button
            variant={listType === 'TV Shows' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setListType('TV Shows')}
            className={listType === 'TV Shows' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600'}
          >
            TV Shows
          </Button>
        </div>
      </div>
  );

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="text-center">
            <div className="h-8 bg-gray-700 rounded w-1/3 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 bg-gray-700 rounded w-1/3"></div>
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-32 bg-gray-700 rounded"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
       <div className="p-6">
         <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">My Lists</h2>
          <p className="text-gray-400 mt-1">Keep track of what you want to watch and what you've seen.</p>
        </div>

        <ListTypeToggle />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Watchlist Section */}
          <section>
            <h3 className="text-xl font-bold text-white mb-4">{listType} Watchlist ({filteredWatchlist.length})</h3>
            <div className="space-y-4">
              {filteredWatchlist.length > 0 ? (
                Object.entries(groupedWatchlist).sort(([a], [b]) => a.localeCompare(b)).map(([genre, items]) => (
                  <GenreGroup key={genre} genre={genre} count={items.length}>
                      {items.map(item => <WatchlistItemCard key={`${item.title}-${item.year}`} item={item} />)}
                  </GenreGroup>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8 bg-gray-800 rounded-lg">Your {listType.toLowerCase()} watchlist is empty.</p>
              )}
            </div>
          </section>

          {/* Watched Section */}
          <section>
            <h3 className="text-xl font-bold text-white mb-4">Watched {listType} ({filteredWatchedList.length})</h3>
            <div className="space-y-4">
               {filteredWatchedList.length > 0 ? (
                  Object.entries(groupedWatchedList).sort(([a], [b]) => a.localeCompare(b)).map(([genre, items]) => (
                      <GenreGroup key={genre} genre={genre} count={items.length}>
                          {items.map(item => <WatchedItemCard key={`${item.title}-${item.year}`} item={item} />)}
                      </GenreGroup>
                  ))
               ) : (
                  <p className="text-gray-500 text-center py-8 bg-gray-800 rounded-lg">You haven't marked any {listType.toLowerCase()} as watched yet.</p>
               )}
            </div>
          </section>
        </div>
       </div>
    </Card>
  );
}
