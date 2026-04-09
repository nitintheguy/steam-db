import { pgTable, serial, text, integer, timestamp, decimal, boolean, primaryKey } from 'drizzle-orm/pg-core'

export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  steamAppId: integer('steam_app_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').default('game'),
  shortDescription: text('short_description'),
  headerImage: text('header_image'),
  developer: text('developer'),
  publisher: text('publisher'),
  releaseDate: text('release_date'),
  isFree: boolean('is_free').default(false),
  currentPrice: decimal('current_price', { precision: 10, scale: 2 }),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }),
  discountPercent: integer('discount_percent').default(0),
  reviewScore: integer('review_score'),
  positiveReviews: integer('positive_reviews').default(0),
  negativeReviews: integer('negative_reviews').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const priceHistory = pgTable('price_history', {
  id: serial('id').primaryKey(),
  gameId: integer('game_id').notNull().references(() => games.id),
  price: decimal('price', { precision: 10, scale: 2 }),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }),
  discountPercent: integer('discount_percent').default(0),
  recordedAt: timestamp('recorded_at').defaultNow(),
})

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
})

export const gameTags = pgTable('game_tags', {
  gameId: integer('game_id').notNull().references(() => games.id),
  tagId: integer('tag_id').notNull().references(() => tags.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.gameId, t.tagId] }),
}))