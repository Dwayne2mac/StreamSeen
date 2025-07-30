import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertWatchlistItemSchema, 
  insertWatchedItemSchema, 
  insertFriendshipSchema 
} from "@shared/schema";
import { z } from "zod";
import { getMovieRecommendation, findStreamingServices, getStructuredInfoForTitle } from "../attached_assets/geminiService_1753887335515";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.get('/api/users/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [watchlist, watched, friends] = await Promise.all([
        storage.getWatchlist(userId),
        storage.getWatchedItems(userId),
        storage.getFriends(userId),
      ]);

      const thisMonth = watched.filter(item => {
        const watchedDate = new Date(item.watchedDate!);
        const now = new Date();
        return watchedDate.getMonth() === now.getMonth() && 
               watchedDate.getFullYear() === now.getFullYear();
      }).length;

      res.json({
        watchlistCount: watchlist.length,
        watchedCount: watched.length,
        friendsCount: friends.length,
        thisMonthCount: thisMonth,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.put('/api/users/privacy', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = req.body;
      
      const updatedUser = await storage.updatePrivacySettings(userId, settings);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      res.status(500).json({ message: "Failed to update privacy settings" });
    }
  });

  // Friend routes
  app.get('/api/friends', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const friends = await storage.getFriends(userId);
      res.json(friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  app.get('/api/friends/requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getFriendRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      res.status(500).json({ message: "Failed to fetch friend requests" });
    }
  });

  app.get('/api/friends/sent-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getSentFriendRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching sent friend requests:", error);
      res.status(500).json({ message: "Failed to fetch sent friend requests" });
    }
  });

  app.post('/api/friends/request', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { friendId } = insertFriendshipSchema.parse(req.body);
      
      const friendship = await storage.sendFriendRequest(userId, friendId);
      res.json(friendship);
    } catch (error) {
      console.error("Error sending friend request:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to send friend request" });
    }
  });

  app.post('/api/friends/accept', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { friendId } = req.body;
      
      await storage.acceptFriendRequest(userId, friendId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error accepting friend request:", error);
      res.status(500).json({ message: "Failed to accept friend request" });
    }
  });

  app.post('/api/friends/decline', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { friendId } = req.body;
      
      await storage.declineFriendRequest(userId, friendId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error declining friend request:", error);
      res.status(500).json({ message: "Failed to decline friend request" });
    }
  });

  app.delete('/api/friends/:friendId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { friendId } = req.params;
      
      await storage.removeFriend(userId, friendId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing friend:", error);
      res.status(500).json({ message: "Failed to remove friend" });
    }
  });

  app.get('/api/friends/suggested', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const suggested = await storage.getSuggestedFriends(userId);
      res.json(suggested);
    } catch (error) {
      console.error("Error fetching suggested friends:", error);
      res.status(500).json({ message: "Failed to fetch suggested friends" });
    }
  });

  app.get('/api/friends/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const results = await storage.searchUsers(q, userId);
      res.json(results);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  app.get('/api/friends/activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activity = await storage.getFriendsActivity(userId);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching friends activity:", error);
      res.status(500).json({ message: "Failed to fetch friends activity" });
    }
  });

  // Watchlist routes
  app.get('/api/watchlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const watchlist = await storage.getWatchlist(userId);
      res.json(watchlist);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  app.post('/api/watchlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemData = insertWatchlistItemSchema.parse({ ...req.body, userId });
      
      const item = await storage.addToWatchlist(itemData);
      res.json(item);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to add to watchlist" });
    }
  });

  app.delete('/api/watchlist/:title/:year', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, year } = req.params;
      
      await storage.removeFromWatchlist(userId, decodeURIComponent(title), parseInt(year));
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      res.status(500).json({ message: "Failed to remove from watchlist" });
    }
  });

  // Watched items routes
  app.get('/api/watched', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const watched = await storage.getWatchedItems(userId);
      res.json(watched);
    } catch (error) {
      console.error("Error fetching watched items:", error);
      res.status(500).json({ message: "Failed to fetch watched items" });
    }
  });

  app.post('/api/watched', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemData = insertWatchedItemSchema.parse({ ...req.body, userId });
      
      const item = await storage.addToWatched(itemData);
      res.json(item);
    } catch (error) {
      console.error("Error adding to watched:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to add to watched" });
    }
  });

  app.put('/api/watched/:title/:year', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, year } = req.params;
      const { rating, comment } = req.body;
      
      await storage.updateWatchedItem(userId, decodeURIComponent(title), parseInt(year), rating, comment || '');
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating watched item:", error);
      res.status(500).json({ message: "Failed to update watched item" });
    }
  });

  app.delete('/api/watched/:title/:year', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, year } = req.params;
      
      await storage.removeFromWatched(userId, decodeURIComponent(title), parseInt(year));
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from watched:", error);
      res.status(500).json({ message: "Failed to remove from watched" });
    }
  });

  app.post('/api/watched/move', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, year, rating, comment } = req.body;
      
      await storage.moveToWatched(userId, title, year, rating, comment || '');
      res.json({ success: true });
    } catch (error) {
      console.error("Error moving to watched:", error);
      res.status(500).json({ message: "Failed to move to watched" });
    }
  });

  // AI Recommendation routes
  app.post('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { genre, mood, platforms, contentType, seriesStatus } = req.body;
      
      // Get user's existing titles to exclude
      const [watchlist, watched] = await Promise.all([
        storage.getWatchlist(userId),
        storage.getWatchedItems(userId),
      ]);
      
      const excludedTitles = [
        ...watchlist.map(item => item.title),
        ...watched.map(item => item.title),
      ];
      
      const recommendation = await getMovieRecommendation(
        genre || 'Any',
        mood || 'Any', 
        platforms || [],
        excludedTitles,
        contentType || 'Movie',
        seriesStatus || 'Any'
      );
      
      res.json(recommendation);
    } catch (error) {
      console.error("Error getting recommendation:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to get recommendation" });
    }
  });

  app.post('/api/streaming-search', isAuthenticated, async (req: any, res) => {
    try {
      const { query } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const result = await findStreamingServices(query);
      res.json(result);
    } catch (error) {
      console.error("Error searching streaming services:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to search streaming services" });
    }
  });

  app.post('/api/title-info', isAuthenticated, async (req: any, res) => {
    try {
      const { title } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }
      
      const info = await getStructuredInfoForTitle(title);
      res.json(info);
    } catch (error) {
      console.error("Error getting title info:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to get title info" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
