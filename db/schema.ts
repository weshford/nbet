import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const records=sqliteTable('records',{id:text('id').primaryKey(),kind:text('kind').notNull(),target:text('target').notNull(),value:text('value').notNull(),updated:text('updated').notNull()});
export const sessions=sqliteTable('sessions',{tokenHash:text('token_hash').primaryKey(),viewer:text('viewer').notNull(),expires:text('expires').notNull()});
export const loginAttempts=sqliteTable('login_attempts',{viewer:text('viewer').primaryKey(),count:text('count').notNull(),resetAt:text('reset_at').notNull()});
