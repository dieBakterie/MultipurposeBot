import { db } from "./database.js";

// Erstelle ein RoleMenu
export async function createRoleMenu(
  messageId,
  channelId,
  groupName,
  mode,
  guildId
) {
  const query = `
    INSERT INTO rolemenus (message_id, channel_id, group_name, mode, guild_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id;
  `;
  const { rows } = await db.query(query, [
    messageId,
    channelId,
    groupName,
    mode,
    guildId,
  ]);
  return rows[0]?.id || null;
}

// Füge ein aktives Setup hinzu
export async function addActiveSetup(messageId, guildId, expiresAt) {
  const query = `
    INSERT INTO active_setups (message_id, guild_id, expires_at)
    VALUES ($1, $2, $3)
    ON CONFLICT (message_id) DO NOTHING;
  `;
  await db.query(query, [messageId, guildId, expiresAt]);
}

// Füge eine Rolle zu einem RoleMenu hinzu
export async function addRoleMenuRole(roleMenuId, emoji, roleId) {
  const query = `
    INSERT INTO rolemenu_roles (rolemenu_id, emoji, role_id)
    VALUES ($1, $2, $3)
    ON CONFLICT (rolemenu_id, emoji) DO UPDATE SET role_id = $3;
  `;
  await db.query(query, [roleMenuId, emoji, roleId]);
}

// Entferne ein aktives Setup
export async function removeActiveSetup(messageId) {
  const query = `
    DELETE FROM active_setups
    WHERE message_id = $1;
  `;
  await db.query(query, [messageId]);
}

// Aktualisiere eine Rolle im RoleMenu
export async function updateRoleMenuRole(roleMenuId, emoji, roleId) {
  const query = `
    UPDATE rolemenu_roles
    SET role_id = $3
    WHERE rolemenu_id = $1 AND emoji = $2
    RETURNING *;
  `;
  const { rows } = await db.query(query, [roleMenuId, emoji, roleId]);
  return rows[0] || null;
}

// Hole alle Rollen eines RoleMenus
export async function fetchRoleMenuRoles(messageId) {
  const query = `
    SELECT r.emoji, r.role_id
    FROM rolemenu_roles r
    JOIN rolemenus m ON r.rolemenu_id = m.id
    WHERE m.message_id = $1;
  `;
  const { rows } = await db.query(query, [messageId]);
  return rows;
}

// Hole alle RoleMenus einer Gilde
export async function fetchAllRoleMenus(guildId) {
  const query = `
    SELECT id, message_id, group_name, mode, created_at, updated_at
    FROM rolemenus
    WHERE guild_id = $1;
  `;
  const { rows } = await db.query(query, [guildId]);
  return rows;
}

// Hole Rollen mit zusätzlichen Informationen
export async function fetchDetailedRoleMenuRoles(messageId) {
  const query = `
    SELECT rr.emoji, rr.role_id, rr.created_at, rr.updated_at
    FROM rolemenu_roles rr
    JOIN rolemenus rm ON rr.rolemenu_id = rm.id
    WHERE rm.message_id = $1;
  `;
  const { rows } = await db.query(query, [messageId]);
  return rows;
}
