-- Custom SQL migration file, put your code below! --
-- Default folder: exactly one row with is_default = 1. The display name comes from i18n, so name is empty.
-- The id is a random UUID v4; app code must look the default folder up by is_default, never by id.
INSERT INTO `folders` (`id`, `sequence`, `name`, `is_default`)
VALUES (
	lower(hex(randomblob(4))) || '-' ||
	lower(hex(randomblob(2))) || '-' ||
	'4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
	substr('89ab', 1 + (abs(random()) % 4), 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
	lower(hex(randomblob(6))),
	0,
	'',
	1
);
--> statement-breakpoint
-- The whole trigger (including the inner semicolon) is a single statement, so no breakpoint inside it.
CREATE TRIGGER `folders_prevent_default_delete`
BEFORE DELETE ON `folders`
WHEN OLD.`is_default` = 1
BEGIN
	SELECT RAISE(ABORT, 'The default folder cannot be deleted');
END;
--> statement-breakpoint
-- is_default is fixed after insert. Otherwise the delete trigger could be bypassed by clearing the flag first.
CREATE TRIGGER `folders_prevent_default_change`
BEFORE UPDATE OF `is_default` ON `folders`
WHEN OLD.`is_default` <> NEW.`is_default`
BEGIN
	SELECT RAISE(ABORT, 'is_default cannot be changed');
END;
