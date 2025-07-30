import {
  users,
  friendships,
  watchlistItems,
  watchedItems,
  activities,
  type User,
  type UpsertUser,
  type Friendship,
  type WatchlistItem,
  type WatchedItem,
  type Activity,
  type InsertWatchlistItem,
  type InsertWatchedItem,
  type InsertFriendship,
  type InsertActivity,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, sql, ne } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Friend operations
  sendFriendRequest(userId: string, friendId: string): Promise<Friendship>;
  getFriendRequests(userId: string): Promise<Array<Friendship & { friend: User }>>;
  getSentFriendRequests(userId: string): Promise<Array<Friendship & { friend: User }>>;
  acceptFriendRequest(userId: string, friendId: string): Promise<void>;
  declineFriendRequest(userId: string, friendId: string): Promise<void>;
  getFriends(userId: string): Promise<User[]>;
  getFriendship(userId: string, friendId: string): Promise<Friendship | undefined>;
  removeFriend(userId: string, friendId: string): Promise<void>;
  
  // Watchlist operations
  addToWatchlist(item: InsertWatchlistItem): Promise<WatchlistItem>;
  removeFromWatchlist(userId: string, title: string, year: number): Promise<void>;
  getWatchlist(userId: string): Promise<WatchlistItem[]>;
  
  // Watched items operations
  addToWatched(item: InsertWatchedItem): Promise<WatchedItem>;
  removeFromWatched(userId: string, title: string, year: number): Promise<void>;
  updateWatchedItem(userId: string, title: string, year: number, rating: number | null, comment: string): Promise<void>;
  getWatchedItems(userId: string): Promise<WatchedItem[]>;
  moveToWatched(userId: string, title: string, year: number, rating: number | null, comment: string): Promise<void>;
  
  // Activity operations
  addActivity(activity: InsertActivity): Promise<Activity>;
  getFriendsActivity(userId: string): Promise<Array<Activity & { user: User }>>;
  
  // Discovery operations
  getSuggestedFriends(userId: string): Promise<User[]>;
  searchUsers(query: string, currentUserId: string): Promise<User[]>;
  
  // Privacy operations
  updatePrivacySettings(userId: string, settings: Partial<User>): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Friend operations
  async sendFriendRequest(userId: string, friendId: string): Promise<Friendship> {
    // Check if friendship already exists
    const existing = await this.getFriendship(userId, friendId);
    if (existing) {
      throw new Error('Friend request already exists or users are already friends');
    }

    const [friendship] = await db
      .insert(friendships)
      .values({ userId, friendId, status: 'pending' })
      .returning();
    
    // Add activity
    const friend = await this.getUser(friendId);
    if (friend) {
      await this.addActivity({
        userId,
        type: 'friend_added',
        friendName: friend.firstName && friend.lastName ? `${friend.firstName} ${friend.lastName}` : friendId,
      });
    }

    return friendship;
  }

  async getFriendRequests(userId: string): Promise<Array<Friendship & { friend: User }>> {
    const requests = await db
      .select({
        id: friendships.id,
        userId: friendships.userId,
        friendId: friendships.friendId,
        status: friendships.status,
        createdAt: friendships.createdAt,
        updatedAt: friendships.updatedAt,
        friend: users,
      })
      .from(friendships)
      .innerJoin(users, eq(friendships.userId, users.id))
      .where(and(
        eq(friendships.friendId, userId),
        eq(friendships.status, 'pending')
      ))
      .orderBy(desc(friendships.createdAt));

    return requests;
  }

  async getSentFriendRequests(userId: string): Promise<Array<Friendship & { friend: User }>> {
    const requests = await db
      .select({
        id: friendships.id,
        userId: friendships.userId,
        friendId: friendships.friendId,
        status: friendships.status,
        createdAt: friendships.createdAt,
        updatedAt: friendships.updatedAt,
        friend: users,
      })
      .from(friendships)
      .innerJoin(users, eq(friendships.friendId, users.id))
      .where(and(
        eq(friendships.userId, userId),
        eq(friendships.status, 'pending')
      ))
      .orderBy(desc(friendships.createdAt));

    return requests;
  }

  async acceptFriendRequest(userId: string, friendId: string): Promise<void> {
    await db
      .update(friendships)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(and(
        eq(friendships.userId, friendId),
        eq(friendships.friendId, userId),
        eq(friendships.status, 'pending')
      ));

    // Create reciprocal friendship
    await db
      .insert(friendships)
      .values({ userId, friendId, status: 'accepted' })
      .onConflictDoNothing();
  }

  async declineFriendRequest(userId: string, friendId: string): Promise<void> {
    await db
      .update(friendships)
      .set({ status: 'declined', updatedAt: new Date() })
      .where(and(
        eq(friendships.userId, friendId),
        eq(friendships.friendId, userId),
        eq(friendships.status, 'pending')
      ));
  }

  async getFriends(userId: string): Promise<User[]> {
    const friends = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        bio: users.bio,
        publicProfile: users.publicProfile,
        showRealName: users.showRealName,
        watchlistPrivacy: users.watchlistPrivacy,
        ratingsPrivacy: users.ratingsPrivacy,
        shareActivity: users.shareActivity,
        emailNotifications: users.emailNotifications,
        friendRecommendations: users.friendRecommendations,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(friendships)
      .innerJoin(users, eq(friendships.friendId, users.id))
      .where(and(
        eq(friendships.userId, userId),
        eq(friendships.status, 'accepted')
      ))
      .orderBy(asc(users.firstName));

    return friends;
  }

  async getFriendship(userId: string, friendId: string): Promise<Friendship | undefined> {
    const [friendship] = await db
      .select()
      .from(friendships)
      .where(or(
        and(eq(friendships.userId, userId), eq(friendships.friendId, friendId)),
        and(eq(friendships.userId, friendId), eq(friendships.friendId, userId))
      ));

    return friendship;
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    await db
      .delete(friendships)
      .where(or(
        and(eq(friendships.userId, userId), eq(friendships.friendId, friendId)),
        and(eq(friendships.userId, friendId), eq(friendships.friendId, userId))
      ));
  }

  // Watchlist operations
  async addToWatchlist(item: InsertWatchlistItem): Promise<WatchlistItem> {
    // Check if item already exists in watchlist or watched list
    const existingWatchlist = await db
      .select()
      .from(watchlistItems)
      .where(and(
        eq(watchlistItems.userId, item.userId),
        eq(watchlistItems.title, item.title),
        eq(watchlistItems.year, item.year)
      ));

    const existingWatched = await db
      .select()
      .from(watchedItems)
      .where(and(
        eq(watchedItems.userId, item.userId),
        eq(watchedItems.title, item.title),
        eq(watchedItems.year, item.year)
      ));

    if (existingWatchlist.length > 0 || existingWatched.length > 0) {
      throw new Error('Item already exists in watchlist or watched list');
    }

    const [watchlistItem] = await db
      .insert(watchlistItems)
      .values(item)
      .returning();

    // Add activity
    await this.addActivity({
      userId: item.userId,
      type: 'added_to_watchlist',
      title: item.title,
      year: item.year,
    });

    return watchlistItem;
  }

  async removeFromWatchlist(userId: string, title: string, year: number): Promise<void> {
    await db
      .delete(watchlistItems)
      .where(and(
        eq(watchlistItems.userId, userId),
        eq(watchlistItems.title, title),
        eq(watchlistItems.year, year)
      ));
  }

  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    const items = await db
      .select()
      .from(watchlistItems)
      .where(eq(watchlistItems.userId, userId))
      .orderBy(desc(watchlistItems.createdAt));

    return items;
  }

  // Watched items operations
  async addToWatched(item: InsertWatchedItem): Promise<WatchedItem> {
    // Check if item already exists
    const existing = await db
      .select()
      .from(watchedItems)
      .where(and(
        eq(watchedItems.userId, item.userId),
        eq(watchedItems.title, item.title),
        eq(watchedItems.year, item.year)
      ));

    if (existing.length > 0) {
      throw new Error('Item already exists in watched list');
    }

    const [watchedItem] = await db
      .insert(watchedItems)
      .values(item)
      .returning();

    // Add activity
    await this.addActivity({
      userId: item.userId,
      type: 'watched',
      title: item.title,
      year: item.year,
      rating: item.rating,
      comment: item.comment,
    });

    return watchedItem;
  }

  async removeFromWatched(userId: string, title: string, year: number): Promise<void> {
    await db
      .delete(watchedItems)
      .where(and(
        eq(watchedItems.userId, userId),
        eq(watchedItems.title, title),
        eq(watchedItems.year, year)
      ));
  }

  async updateWatchedItem(userId: string, title: string, year: number, rating: number | null, comment: string): Promise<void> {
    await db
      .update(watchedItems)
      .set({ rating, comment })
      .where(and(
        eq(watchedItems.userId, userId),
        eq(watchedItems.title, title),
        eq(watchedItems.year, year)
      ));

    // Add activity for rating update
    if (rating !== null) {
      await this.addActivity({
        userId,
        type: 'rated',
        title,
        year,
        rating,
        comment,
      });
    }
  }

  async getWatchedItems(userId: string): Promise<WatchedItem[]> {
    const items = await db
      .select()
      .from(watchedItems)
      .where(eq(watchedItems.userId, userId))
      .orderBy(desc(watchedItems.watchedDate));

    return items;
  }

  async moveToWatched(userId: string, title: string, year: number, rating: number | null, comment: string): Promise<void> {
    // Get the watchlist item
    const [watchlistItem] = await db
      .select()
      .from(watchlistItems)
      .where(and(
        eq(watchlistItems.userId, userId),
        eq(watchlistItems.title, title),
        eq(watchlistItems.year, year)
      ));

    if (!watchlistItem) {
      throw new Error('Watchlist item not found');
    }

    // Add to watched items
    await this.addToWatched({
      userId,
      title: watchlistItem.title,
      year: watchlistItem.year,
      summary: watchlistItem.summary,
      genre: watchlistItem.genre,
      streamingService: watchlistItem.streamingService,
      reason: watchlistItem.reason,
      contentType: watchlistItem.contentType,
      franchiseMovies: watchlistItem.franchiseMovies as any,
      rating,
      comment,
      watchedDate: new Date(),
    });

    // Remove from watchlist
    await this.removeFromWatchlist(userId, title, year);
  }

  // Activity operations
  async addActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values(activity)
      .returning();

    return newActivity;
  }

  async getFriendsActivity(userId: string): Promise<Array<Activity & { user: User }>> {
    const friendIds = await db
      .select({ friendId: friendships.friendId })
      .from(friendships)
      .where(and(
        eq(friendships.userId, userId),
        eq(friendships.status, 'accepted')
      ));

    if (friendIds.length === 0) {
      return [];
    }

    const friendIdList = friendIds.map(f => f.friendId);

    const activitiesWithUsers = await db
      .select({
        id: activities.id,
        userId: activities.userId,
        type: activities.type,
        title: activities.title,
        year: activities.year,
        rating: activities.rating,
        comment: activities.comment,
        friendName: activities.friendName,
        createdAt: activities.createdAt,
        user: users,
      })
      .from(activities)
      .innerJoin(users, eq(activities.userId, users.id))
      .where(sql`${activities.userId} = ANY(${friendIdList})`)
      .orderBy(desc(activities.createdAt))
      .limit(20);

    return activitiesWithUsers;
  }

  // Discovery operations
  async getSuggestedFriends(userId: string): Promise<User[]> {
    // Get users who are not already friends and have similar interests
    const friends = await db
      .select({ friendId: friendships.friendId })
      .from(friendships)
      .where(and(
        eq(friendships.userId, userId),
        eq(friendships.status, 'accepted')
      ));

    const pendingRequests = await db
      .select({ friendId: friendships.friendId })
      .from(friendships)
      .where(and(
        eq(friendships.userId, userId),
        eq(friendships.status, 'pending')
      ));

    const receivedRequests = await db
      .select({ userId: friendships.userId })
      .from(friendships)
      .where(and(
        eq(friendships.friendId, userId),
        eq(friendships.status, 'pending')
      ));

    const excludeIds = [
      userId,
      ...friends.map(f => f.friendId),
      ...pendingRequests.map(f => f.friendId),
      ...receivedRequests.map(f => f.userId),
    ];

    const suggested = await db
      .select()
      .from(users)
      .where(and(
        sql`${users.id} != ALL(${excludeIds})`,
        eq(users.publicProfile, true),
        eq(users.friendRecommendations, true)
      ))
      .limit(10);

    return suggested;
  }

  async searchUsers(query: string, currentUserId: string): Promise<User[]> {
    const searchResults = await db
      .select()
      .from(users)
      .where(and(
        ne(users.id, currentUserId),
        eq(users.publicProfile, true),
        or(
          sql`${users.firstName} ILIKE ${`%${query}%`}`,
          sql`${users.lastName} ILIKE ${`%${query}%`}`,
          sql`${users.email} ILIKE ${`%${query}%`}`
        )
      ))
      .limit(20);

    return searchResults;
  }

  // Privacy operations
  async updatePrivacySettings(userId: string, settings: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return user;
  }
}

export const storage = new DatabaseStorage();
