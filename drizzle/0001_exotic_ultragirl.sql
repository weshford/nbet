CREATE TABLE `login_attempts` (
	`viewer` text PRIMARY KEY NOT NULL,
	`count` text NOT NULL,
	`reset_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`viewer` text NOT NULL,
	`expires` text NOT NULL
);
