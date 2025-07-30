import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  publicProfile: boolean("public_profile").default(true),
  showRealName: boolean("show_real_name").default(true),
  watchlistPrivacy: varchar("watchlist_privacy", { enum: ['public', 'friends', 'private'] }).default('friends'),
  ratingsPrivacy: varchar("ratings_privacy", { enum: ['public', 'friends', 'private'] }).default('friends'),
  shareActivity: boolean("share_activity").default(true),
  emailNotifications: boolean("email_notifications").default(false),
  friendRecommendations: boolean("friend_recommendations").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Friendships table
export const friendships = pgTable("friendships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  friendId: varchar("friend_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar("status", { enum: ['pending', 'accepted', 'declined', 'blocked'] }).notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Watchlist items
export const watchlistItems = pgTable("watchlist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  year: integer("year").notNull(),
  summary: text("summary").notNull(),
  genre: varchar("genre").notNull(),
  streamingService: varchar("streaming_service").notNull(),
  reason: text("reason").notNull(),
  contentType: varchar("content_type", { enum: ['Movie', 'TV Show'] }).notNull(),
  franchiseMovies: jsonb("franchise_movies"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Watched items
export const watchedItems = pgTable("watched_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  year: integer("year").notNull(),
  summary: text("summary").notNull(),
  genre: varchar("genre").notNull(),
  streamingService: varchar("streaming_service").notNull(),
  reason: text("reason").notNull(),
  contentType: varchar("content_type", { enum: ['Movie', 'TV Show'] }).notNull(),
  franchiseMovies: jsonb("franchise_movies"),
  rating: integer("rating"),
  comment: text("comment").default(''),
  watchedDate: timestamp("watched_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity feed items
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar("type", { enum: ['watched', 'added_to_watchlist', 'rated', 'friend_added'] }).notNull(),
  title: text("title"),
  year: integer("year"),
  rating: integer("rating"),
  comment: text("comment"),
  friendName: varchar("friend_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  watchlistItems: many(watchlistItems),
  watchedItems: many(watchedItems),
  activities: many(activities),
  sentFriendRequests: many(friendships, { relationName: 'sentRequests' }),
  receivedFriendRequests: many(friendships, { relationName: 'receivedRequests' }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  user: one(users, {
    fields: [friendships.userId],
    references: [users.id],
    relationName: 'sentRequests',
  }),
  friend: one(users, {
    fields: [friendships.friendId],
    references: [users.id],
    relationName: 'receivedRequests',
  }),
}));

export const watchlistItemsRelations = relations(watchlistItems, ({ one }) => ({
  user: one(users, {
    fields: [watchlistItems.userId],
    references: [users.id],
  }),
}));

export const watchedItemsRelations = relations(watchedItems, ({ one }) => ({
  user: one(users, {
    fields: [watchedItems.userId],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

// Schema types
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWatchlistItemSchema = createInsertSchema(watchlistItems).omit({
  id: true,
  createdAt: true,
});

export const insertWatchedItemSchema = createInsertSchema(watchedItems).omit({
  id: true,
  createdAt: true,
});

export const insertFriendshipSchema = createInsertSchema(friendships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Friendship = typeof friendships.$inferSelect;
export type WatchlistItem = typeof watchlistItems.$inferSelect;
export type WatchedItem = typeof watchedItems.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type InsertWatchlistItem = z.infer<typeof insertWatchlistItemSchema>;
export type InsertWatchedItem = z.infer<typeof insertWatchedItemSchema>;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
