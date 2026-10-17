CREATE TABLE `folders` (
	`id` text PRIMARY KEY NOT NULL,
	`sequence` integer NOT NULL,
	`name` text NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `folders_single_default_idx` ON `folders` (`is_default`) WHERE "folders"."is_default" = 1;--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`folder_id` text NOT NULL,
	`gacha_id` text NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`thumbnail` text,
	`memo` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`folder_id`) REFERENCES `folders`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "items_type_check" CHECK("items"."type" IN ('WISH', 'GET'))
);
--> statement-breakpoint
CREATE INDEX `items_folder_id_idx` ON `items` (`folder_id`);--> statement-breakpoint
CREATE INDEX `items_gacha_id_idx` ON `items` (`gacha_id`);