-- Up
CREATE TABLE characters (server_id INTEGER NOT NULL, name TEXT NOT NULL COLLATE NOCASE, info TEXT, user_id INTEGER NOT NULL);
CREATE INDEX characters_index ON characters (server_id, name);
/*CREATE TABLE mod_roles (server_id INTEGER NOT NULL, role_id INTEGER NOT NULL);
CREATE INDEX mod_roles_index ON mod_roles (server_id, role_id);
CREATE TABLE settings (server_id INTEGER, key TEXT NOT NULL, value TEXT);
CREATE INDEX settings_index ON settings (server_id, key);*/

-- Down
DROP TABLE characters;
DROP INDEX characters_index;
/*DROP TABLE mod_roles;
DROP INDEX mod_roles_index;
DROP TABLE settings;
DROP INDEX settings_index;*/
