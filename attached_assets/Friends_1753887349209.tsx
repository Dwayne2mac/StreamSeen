
import React, { useState, useEffect, useCallback } from 'react';
import { Friend, FriendWatchlistItem, FriendWatchedItem, FriendGeneratedLists, MovieRecommendation } from '../types';
import { generateFriendWatchlist } from '../services/geminiService';
import Card from './common/Card';
import Spinner from './common/Spinner';
import StarRating from './common/StarRating';
import { useWatchlist } from '../context/WatchlistContext';
import GenreGroup from './common/GenreGroup';


const FriendItemCard: React.FC<{
  item: FriendWatchlistItem | FriendWatchedItem;
  isWatched: boolean;
}> = ({ item, isWatched }) => {
    const { addToWatchlist, watchlist, watchedList } = useWatchlist();
    const [added, setAdded] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const isAlreadyInUserLists = useCallback(() => {
        const titleToCompare = item.title.trim().toLowerCase();
        const inWatchlist = watchlist.some(i => i.title.trim().toLowerCase() === titleToCompare && i.year === item.year);
        const inWatchedList = watchedList.some(i => i.title.trim().toLowerCase() === titleToCompare && i.year === item.year);
        return inWatchlist || inWatchedList;
    }, [item.title, item.year, watchlist, watchedList]);

    const handleAddItemToMyWatchlist = () => {
        const newItem: MovieRecommendation = {
            title: item.title,
            year: item.year,
            summary: item.summary,
            genre: item.genre,
            contentType: item.contentType,
            streamingService: 'Unknown', // Friend's list doesn't have this info
            reason: `Added from a friend's list. Their reason: "${item.reason}"`,
        };
        addToWatchlist(newItem);
        setAdded(true);
    };
    
    const inLists = isAlreadyInUserLists();

    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <h4 className="font-bold text-md text-white">{item.title} <span className="font-normal text-gray-400">({item.year})</span></h4>
                    {isWatched && 'rating' in item && (
                        <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={item.rating} setRating={() => {}} readOnly={true} size="sm" />
                            {item.rating && <span className="text-xs text-gray-400">({item.rating}/5)</span>}
                        </div>
                    )}
                    <p className="text-sm text-indigo-200 mt-1 italic">"{item.reason}"</p>
                </div>
                 <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">{isExpanded ? 'Hide' : 'Summary'}</button>
                    <button
                        onClick={handleAddItemToMyWatchlist}
                        disabled={inLists || added}
                        className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold py-1 px-3 rounded-lg transition-colors duration-200 text-xs whitespace-nowrap"
                    >
                         {inLists ? 'In My Lists' : (added ? 'Added!' : 'Add to My Watchlist')}
                    </button>
                 </div>
            </div>
             {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-700 animate-fade-in">
                    <p className="text-gray-300 text-sm">{item.summary}</p>
                </div>
            )}
        </div>
    );
};

const Friends: React.FC = () => {
    const [friends, setFriends] = useState<Friend[]>(() => {
        try {
            const localData = localStorage.getItem('friends');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            return [];
        }
    });

    const [newFriendName, setNewFriendName] = useState('');
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    const [friendLists, setFriendLists] = useState<FriendGeneratedLists | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem('friends', JSON.stringify(friends));
    }, [friends]);

    const handleAddFriend = () => {
        if (newFriendName.trim()) {
            const newFriend: Friend = { id: Date.now().toString(), name: newFriendName.trim() };
            setFriends(prev => [...prev, newFriend]);
            setNewFriendName('');
        }
    };

    const handleRemoveFriend = (friendId: string) => {
        setFriends(prev => prev.filter(f => f.id !== friendId));
        if (selectedFriend?.id === friendId) {
            setSelectedFriend(null);
            setFriendLists(null);
        }
    };

    const handleSelectFriend = async (friend: Friend) => {
        if (selectedFriend?.id === friend.id && friendLists && !error) return;
        setSelectedFriend(friend);
        setLoading(true);
        setError(null);
        setFriendLists(null);
        try {
            const lists = await generateFriendWatchlist(friend.name);
            setFriendLists(lists);
        } catch (e: any) {
            setError(e.message || "Failed to fetch friend's watchlist.");
        } finally {
            setLoading(false);
        }
    };
    
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

    const FriendListsDisplay: React.FC = () => {
        if (loading) return <div className="flex justify-center items-center h-full pt-10"><Spinner /></div>;
        if (error) return <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>;
        if (!friendLists || (!friendLists.watchlist.length && !friendLists.watchedList.length)) {
            return <p className="text-gray-500 text-center py-8 bg-gray-800 rounded-lg">Could not generate lists for {selectedFriend?.name}. Try again?</p>;
        }

        const groupedWatchlist = friendLists.watchlist.length > 0 ? groupItemsByGenre(friendLists.watchlist) : {};
        const groupedWatchedList = friendLists.watchedList.length > 0 ? groupItemsByGenre(friendLists.watchedList) : {};

        return (
            <div className="animate-fade-in">
                <h3 className="text-2xl font-bold text-center text-indigo-300 mb-6">Viewing lists for {selectedFriend?.name}</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Watchlist Section */}
                    <section>
                        <h4 className="text-xl font-bold text-white mb-4">Wants to Watch ({friendLists.watchlist.length})</h4>
                        <div className="space-y-4">
                            {friendLists.watchlist.length > 0 ? (
                                Object.entries(groupedWatchlist).sort(([a], [b]) => a.localeCompare(b)).map(([genre, items]) => (
                                    <GenreGroup key={`watchlist-${genre}`} genre={genre} count={items.length}>
                                        {items.map(item => <FriendItemCard key={`${item.title}-${item.year}`} item={item} isWatched={false} />)}
                                    </GenreGroup>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8 bg-gray-800 rounded-lg">{selectedFriend?.name}'s watchlist is empty.</p>
                            )}
                        </div>
                    </section>
                    {/* Watched List Section */}
                    <section>
                        <h4 className="text-xl font-bold text-white mb-4">Has Watched ({friendLists.watchedList.length})</h4>
                        <div className="space-y-4">
                            {friendLists.watchedList.length > 0 ? (
                                Object.entries(groupedWatchedList).sort(([a], [b]) => a.localeCompare(b)).map(([genre, items]) => (
                                    <GenreGroup key={`watched-${genre}`} genre={genre} count={items.length}>
                                        {items.map(item => <FriendItemCard key={`${item.title}-${item.year}`} item={item as FriendWatchedItem} isWatched={true} />)}
                                    </GenreGroup>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8 bg-gray-800 rounded-lg">{selectedFriend?.name} has no watched items.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        );
    };
    
    return (
        <Card className="w-full max-w-5xl mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">Friends' Watchlists</h2>
                <p className="text-gray-400 mt-1">Add friends and see what they're watching.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left column for adding and listing friends */}
                <div className="md:col-span-1">
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-3">Add a Friend</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newFriendName}
                                onChange={(e) => setNewFriendName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()}
                                placeholder="Friend's Name"
                                className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                            />
                            <button
                                onClick={handleAddFriend}
                                disabled={!newFriendName.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-white mb-3">Your Friends ({friends.length})</h3>
                        <div className="space-y-2">
                            {friends.length > 0 ? friends.map(friend => (
                                <div
                                    key={friend.id}
                                    className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedFriend?.id === friend.id ? 'bg-indigo-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                                    onClick={() => handleSelectFriend(friend)}
                                >
                                    <span className="font-medium">{friend.name}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveFriend(friend.id); }}
                                        className="text-gray-400 hover:text-red-400"
                                        aria-label={`Remove ${friend.name}`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                            )) : (
                                <p className="text-gray-500 text-sm p-4 text-center bg-gray-800 rounded-lg">You haven't added any friends yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right column for displaying selected friend's lists */}
                <div className="md:col-span-2">
                    {selectedFriend ? (
                        <FriendListsDisplay />
                    ) : (
                        <div className="flex justify-center items-center h-full bg-gray-800/50 rounded-lg p-8">
                            <p className="text-gray-400 text-center">Select a friend from the list to see their watchlist.</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default Friends;
