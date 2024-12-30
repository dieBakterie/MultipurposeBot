// src/database/rolemenuDatabase.ts
lemenuDatabase.js
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

// Hole alle Rollen einer Gruppe
export async function fetchGroupRoles(messageId) {
  const query = `
    SELECT r.emoji, r.role_id
    FROM rolemenu_roles r
    JOIN rolemenus m ON r.rolemenu_id = m.id
    WHERE m.message_id = $1;
  `;
  const { rows } = await db.query(query, [messageId]);
  return rows;
}

// Erstelle eine neue Gruppe
export async function createRoleMenuGroup(groupName, mode, guildId) {
  const query = `
    INSERT INTO rolemenus (group_name, mode, guild_id, created_at, updated_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (group_name, guild_id) DO UPDATE SET
      mode = EXCLUDED.mode,
      updated_at = CURRENT_TIMESTAMP
    RETURNING id;
  `;
  const { rows } = await db.query(query, [groupName, mode, guildId]);
  return rows[0]?.id || null;
}

// Füge Rollen zu einer Gruppe hinzu
export async function addRolesToGroup(groupName, roleId, label, guildId) {
  const query = `
    INSERT INTO rolemenu_roles (rolemenu_id, role_id, label, created_at, updated_at)
    SELECT id, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    FROM rolemenus
    WHERE group_name = $1 AND guild_id = $4
    ON CONFLICT (rolemenu_id, role_id) DO UPDATE SET
      label = EXCLUDED.label,
      updated_at = CURRENT_TIMESTAMP;
  `;
  await db.query(query, [groupName, roleId, label, guildId]);
}

// Aktualisiere eine Gruppe (z.B. Name, Modus)
export async function updateRoleMenuGroup(groupName, newMode, guildId) {
  const query = `
    UPDATE rolemenus
    SET mode = $2, updated_at = CURRENT_TIMESTAMP
    WHERE group_name = $1 AND guild_id = $3
    RETURNING *;
  `;
  const { rows } = await db.query(query, [groupName, newMode, guildId]);
  return rows[0] || null;
}

// Entferne eine Gruppe und ihre Rollen
export async function deleteRoleMenuGroup(groupName, guildId) {
  const query = `
    DELETE FROM rolemenus
    WHERE group_name = $1 AND guild_id = $2
    RETURNING id;
  `;
  const { rows } = await db.query(query, [groupName, guildId]);

  if (rows.length > 0) {
    const roleMenuId = rows[0].id;

    // Entferne alle Rollen dieser Gruppe
    await db.query(
      `
      DELETE FROM rolemenu_roles
      WHERE rolemenu_id = $1;
    `,
      [roleMenuId]
    );
  }

  return rows[0]?.id || null;
}

// Hole alle Gruppen einer Gilde
export async function fetchAllGroups(guildId) {
  const query = `
    SELECT id, group_name, mode, created_at, updated_at
    FROM rolemenus
    WHERE guild_id = $1;
  `;
  const { rows } = await db.query(query, [guildId]);
  return rows;
}

// Hole alle Rollen einer Gruppe
export async function fetchGroupRolesByName(groupName, guildId) {
  const query = `
    SELECT rr.role_id, rr.label, rr.emoji
    FROM rolemenu_roles rr
    JOIN rolemenus rm ON rr.rolemenu_id = rm.id
    WHERE rm.group_name = $1 AND rm.guild_id = $2;
  `;
  const { rows } = await db.query(query, [groupName, guildId]);
  return rows;
}

// Aktualisiere eine Rolle in einer Gruppe
export async function updateGroupRole(groupName, roleId, newLabel, newEmoji) {
  const query = `
    UPDATE rolemenu_roles
    SET label = $3, emoji = $4, updated_at = CURRENT_TIMESTAMP
    WHERE role_id = $2 AND rolemenu_id = (
      SELECT id FROM rolemenus WHERE group_name = $1
    )
    RETURNING *;
  `;
  const { rows } = await db.query(query, [
    groupName,
    roleId,
    newLabel,
    newEmoji,
  ]);
  return rows[0] || null;
}

// Hole Details einer Gruppe
export async function fetchGroupDetails(groupName, guildId) {
  const query = `
    SELECT id, group_name, mode, created_at, updated_at
    FROM rolemenus
    WHERE group_name = $1 AND guild_id = $2;
  `;
  const { rows } = await db.query(query, [groupName, guildId]);
  return rows[0] || null;
}

// Entferne eine spezifische Rolle aus einer Gruppe
export async function removeRoleFromGroup(groupName, roleId, guildId) {
  const query = `
    DELETE FROM rolemenu_roles
    WHERE role_id = $1 AND rolemenu_id = (
      SELECT id FROM rolemenus WHERE group_name = $2 AND guild_id = $3
    )
    RETURNING *;
  `;
  const { rows } = await db.query(query, [roleId, groupName, guildId]);
  return rows[0] || null;
}
