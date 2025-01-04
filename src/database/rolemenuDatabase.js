// src/database/rolemenuDatabase.js
import { executeQuery } from '../utils/databaseUtils.js';
import { createSuccessResponse, logAndThrowError } from '../utils/helpers.js';
import { validateValue, validateFields } from '../utils/validation.js';
import { discordFeedbackError, discordFeedbackSuccess } from '../alias.js';

// Erstelle ein RoleMenu
export async function createRoleMenu(
  messageId,
  channelId,
  groupName,
  mode,
  guildId
) {
  validateFields({
    message_id: messageId,
    channel_id: channelId,
    group_name: groupName,
    mode: mode,
    guild_id: guildId
  }, discordFeedbackError.emoji, 'Fehler beim Erstellen des RoleMenus', true);
  try {
    const result = await executeQuery('INSERT', 'rolemenus', {
      message_id: messageId,
      channel_id: channelId,
      group_name: groupName,
      mode: mode,
      guild_id: guildId
    }, {}, {
      target: 'message_id',
      action: 'NOTHING'
    });
    return createSuccessResponse(true, discordFeedbackSuccess.emoji, `RoleMenu für ${groupName} erfolgreich erstellt.`, result.rows[0]);
  } catch (error) {
    logAndThrowError(discordFeedbackError.emoji, `Fehler beim Erstellen des RoleMenus für ${groupName}`, error);
  }
}

// Füge ein aktives Setup hinzu
export async function addActiveSetup(messageId, guildId, expiresAt) {
  validateFields({
    message_id: messageId,
    guild_id: guildId,
    expires_at: expiresAt
  }, discordFeedbackError.emoji, 'Fehler beim Hinzufügen des aktiven Setups', true);
  try {
    await executeQuery('INSERT', 'active_setups', {
      message_id: messageId,
      guild_id: guildId,
      expires_at: expiresAt
    }, {}, {
      target: 'message_id',
      action: 'NOTHING'
    });
    return createSuccessResponse(true, discordFeedbackSuccess.emoji, `Aktives Setup für ${messageId} erfolgreich hinzugefügt.`);
  } catch (error) {
    logAndThrowError(discordFeedbackError.emoji, `Fehler beim Hinzufügen des aktiven Setups für ${messageId}`, error);
  }
}

// Füge eine Rolle zu einem RoleMenu hinzu
export async function addRoleMenuRole(roleMenuId, emoji, roleId) {
  validateFields({
    role_menu_id: roleMenuId,
    emoji: emoji,
    role_id: roleId
  }, discordFeedbackError.emoji, 'Fehler beim Hinzufügen der Rolle zu RoleMenu', true);
  try {
    await executeQuery('INSERT', 'rolemenu_roles', {
      rolemenu_id: roleMenuId,
      emoji: emoji,
      role_id: roleId
    }, {}, {
      target: 'rolemenu_id, emoji',
      action: 'UPDATE SET role_id = EXCLUDED.role_id'
    });
    return createSuccessResponse(true, discordFeedbackSuccess.emoji, `Rolle ${roleId} erfolgreich zu RoleMenu ${roleMenuId} hinzugefügt.`);
  } catch (error) {
    logAndThrowError(discordFeedbackError.emoji, `Fehler beim Hinzufügen der Rolle ${roleId} zu RoleMenu ${roleMenuId}`, error);
  }
}

// Entferne ein aktives Setup
export async function removeActiveSetup(messageId) {
  validateValue(messageId, discordFeedbackError.emoji, 'Fehler beim Entfernen des aktiven Setups', true);
  try {
    await executeQuery('DELETE', 'active_setups', {}, {
      message_id: messageId
    }, {
      target: 'message_id',
      action: 'NOTHING'
    });
    return createSuccessResponse(true, discordFeedbackSuccess.emoji, `Aktives Setup für ${messageId} erfolgreich entfernt.`);
  } catch (error) {
    logAndThrowError(discordFeedbackError.emoji, `Fehler beim Entfernen des aktiven Setups für ${messageId}`, error);
  }
}

// Aktualisiere eine Rolle im RoleMenu
export async function updateRoleMenuRole(roleMenuId, emoji, roleId) {
  validateFields({
    role_menu_id: roleMenuId,
    emoji: emoji,
    role_id: roleId
  }, discordFeedbackError.emoji, 'Fehler beim Aktualisieren der Rolle im RoleMenu');
  try {
    await executeQuery('UPDATE', 'rolemenu_roles', {
      role_id: roleId
    }, {
      rolemenu_id: roleMenuId,
      emoji: emoji
    }, {
      target: 'rolemenu_id, emoji',
      action: 'NOTHING'
    });
    return createSuccessResponse(true, discordFeedbackSuccess.emoji, `Rolle im RoleMenu ${roleMenuId} erfolgreich aktualisiert.`);
  } catch (error) {
    logAndThrowError(discordFeedbackError.emoji, `Fehler beim Aktualisieren der Rolle im RoleMenu ${roleMenuId}`, error);
  }
}

// Hole alle Rollen eines RoleMenus
export async function fetchRoleMenuRoles(messageId) {
  validateFields({
    message_id : messageId
  }, discordFeedbackError.emoji, 'Fehler beim Abrufen der Rollen des RoleMenus');
  try {
    const result = await executeQuery('SELECT', 'rolemenu_roles', {}, {
      message_id: messageId
    }, {
      target: 'message_id',
      action: 'NOTHING'
    });
    return createSuccessResponse(true, discordFeedbackSuccess.emoji, `Rollen für RoleMenu ${messageId} erfolgreich abgerufen.`, result.rows);
  } catch (error) {
    logAndThrowError(discordFeedbackError.emoji, `Fehler beim Abrufen der Rollen für RoleMenu ${messageId}`, error);
  }
}

// Hole alle RoleMenus einer Gilde
export async function fetchAllRoleMenus(guildId) {
  validateFields({
    guild_id: guildId
  }, discordFeedbackError.emoji, 'Fehler beim Abrufen der RoleMenus');
  try {
    const result = await executeQuery('SELECT', 'rolemenus', {}, {
      guild_id: guildId
    }, {
      target: 'guild_id',
      action: 'NOTHING'
    });
    return createSuccessResponse(true, discordFeedbackSuccess.emoji, `Alle RoleMenus für Gilde ${guildId} erfolgreich abgerufen.`, result.rows);
  } catch (error) {
    logAndThrowError(discordFeedbackError.emoji, `Fehler beim Abrufen der RoleMenus für Gilde ${guildId}`, error);
  }
}

// Hole Rollen mit zusätzlichen Informationen
export async function fetchDetailedRoleMenuRoles(messageId) {
  validateFields({
    message_id : messageId
  }, discordFeedbackError.emoji, 'Fehler beim Abrufen der Rollen des RoleMenus');
  try {
    const result = await executeQuery('SELECT', 'rolemenu_roles', {}, {
      message_id: messageId
    }, {
      target: 'message_id',
      action: 'NOTHING'
    });
    return createSuccessResponse(true, discordFeedbackSuccess.emoji, `Detaillierte Rolleninformationen für RoleMenu ${messageId} erfolgreich abgerufen.`, result.rows);
  } catch (error) {
    logAndThrowError(discordFeedbackError.emoji, `Fehler beim Abrufen der detaillierten Rolleninformationen für RoleMenu ${messageId}`, error);
  }
}

// Hole alle Rollen einer Gruppe
export async function fetchGroupRoles(messageId) {
  validateFields({
    message_id : messageId
  }, discordFeedbackError.emoji, 'Fehler beim Abrufen der Rollen des RoleMenus');
  try {
    const result = await executeQuery('SELECT', 'rolemenu_roles', {}, {
      message_id: messageId
    }, {
      target: 'message_id',
      action: 'NOTHING'
    });
    return createSuccessResponse(true, discordFeedbackSuccess.emoji, `Rollen für Gruppe ${messageId} erfolgreich abgerufen.`, result.rows);
  } catch (error) {
    logAndThrowError(discordFeedbackError.emoji, `Fehler beim Abrufen der Rollen für Gruppe ${messageId} für Gilde ${guildId}`, error);
  }
}

// Erstelle eine neue Gruppe
export async function createRoleMenuGroup(groupName, mode, guildId) {
  validateFields({
    group_name : groupName,
    mode : mode,
    guild_id : guildId
  }, discordFeedbackError.emoji, 'Fehler beim Erstellen der Gruppe');
  try {
    await executeQuery('INSERT', 'rolemenu_groups', {
      group_name: groupName,
      mode: mode,
      guild_id: guildId
    }, {}, {
      target: 'group_name, guild_id',
      action: 'UPDATE SET mode = EXCLUDED.mode'
    });
    return createSuccessResponse(true, discordFeedbackSuccess.emoji, `Gruppe ${groupName} erfolgreich erstellt.`);
  } catch (error) {
    logAndThrowError(discordFeedbackError.emoji, `Fehler beim Erstellen der Gruppe ${groupName}`, error);
  }
}

// Füge Rollen zu einer Gruppe hinzu
export async function addRolesToGroup(groupName, roleId, label, guildId) {
  validateFields({
    group_name : groupName,
    role_id : roleId,
    label : label,
    guild_id : guildId
  }, discordFeedbackError.emoji, 'Fehler beim Hinzufügen der Rolle zur Gruppe');
  try {
    await executeQuery('INSERT', 'group_roles', {
      group_name: groupName,
      role_id: roleId,
      label: label,
      guild_id: guildId
    }, {}, {
      target: 'group_name, role_id, guild_id',
      action: 'UPDATE SET label = EXCLUDED.label'
    });
    return createSuccessResponse(true, discordFeedbackSuccess.emoji, `Rolle ${roleId} erfolgreich zur Gruppe ${groupName} hinzugefügt.`);
  } catch (error) {
    logAndThrowError(discordFeedbackError.emoji, `Fehler beim Hinzufügen der Rolle ${roleId} zur Gruppe ${groupName}`, error);
  }
}

// Aktualisiere eine Gruppe (z.B. Name, Modus)
export async function updateRoleMenuGroup(groupName, newMode, guildId) {
  validateFields({
    group_name : groupName,
    mode : newMode,
    guild_id : guildId
  }, discordFeedbackError.emoji, 'Fehler beim Aktualisieren der Gruppe');
  try {
    await executeQuery('UPDATE', 'rolemenu_groups', {
      mode: newMode
    }, {
      group_name: groupName,
      guild_id: guildId
    }, {
      target: 'group_name, guild_id',
      action: 'NOTHING'
    });
    return createSuccessResponse(true, discordFeedbackSuccess.emoji, `Gruppe ${groupName} erfolgreich aktualisiert.`);
  } catch (error) {
    logAndThrowError(discordFeedbackError.emoji, `Fehler beim Aktualisieren der Gruppe ${groupName}`, error);
  }
}

// Entferne eine Gruppe und ihre Rollen
export async function deleteRoleMenuGroup(groupName, guildId) {
  validateFields({
    group_name : groupName,
    guild_id : guildId
  }, discordFeedbackError.emoji, `Fehler beim Entfernen der Gruppe ${groupName}`);
  try {
    const group = await fetchGroupDetails(groupName, guildId);
    if (group) {
      await executeQuery('DELETE', 'rolemenu_roles', {}, {
        rolemenu_id: group.id
      }, {
        target: 'rolemenu_id',
        action: 'NOTHING'
      });
      await executeQuery('DELETE', 'rolemenus', {}, {
        group_name: groupName,
        guild_id: guildId
      }, {
        target: 'group_name, guild_id',
        action: 'NOTHING'
      });
      return createSuccessResponse(true, discordFeedbackSuccess.emoji, `Gruppe ${groupName} erfolgreich entfernt.`);
    } else {
      return createSuccessResponse(false, discordFeedbackError.emoji, `Gruppe ${groupName} nicht gefunden.`);
    }
  } catch (error) {
    logAndThrowError(discordFeedbackError.emoji, `Fehler beim Entfernen der Gruppe ${groupName}`, error);
  }
}

// Hole alle Gruppen einer Gilde
export async function fetchAllGroups(guildId) {
  validateFields({
    guild_id: guildId
  }, discordFeedbackError.emoji, `Fehler beim Abrufen der Gruppen für Gilde ${guildId}`);
  try {
    const result = await executeQuery('SELECT', 'rolemenu_groups', {}, {
      guild_id: guildId
    }, {
      target: 'guild_id',
      action: 'NOTHING'
    });
    return createSuccessResponse(true, discordFeedbackSuccess.emoji, `Alle Gruppen für Gilde ${guildId} erfolgreich abgerufen.`, result.rows);
  } catch (error) {
    logAndThrowError(discordFeedbackError.emoji, `Fehler beim Abrufen der Gruppen für Gilde ${guildId}`, error);
  }
}

// Hole alle Rollen einer Gruppe
export async function fetchGroupRolesByName(groupName, guildId) {
  validateFields({
    group_name : groupName,
    guild_id : guildId
  }, discordFeedbackError.emoji, `Fehler beim Abrufen der Rollen für Gruppe ${groupName} für Gilde ${guildId}`);
  try {
    const result = await executeQuery('SELECT', 'group_roles', {}, {
      group_name: groupName,
      guild_id: guildId
    }, {
      target: 'group_name, guild_id',
      action: 'NOTHING'
    });
    return createSuccessResponse(true, discordFeedbackSuccess.emoji, `Rollen für Gruppe ${groupName} erfolgreich abgerufen.`, result.rows);
  } catch (error) {
    logAndThrowError(discordFeedbackError.emoji, `Fehler beim Abrufen der Rollen für Gruppe ${groupName}`, error);
  }
}

// Aktualisiere eine Rolle in einer Gruppe
export async function updateGroupRole(groupName, roleId, newLabel, newEmoji) {
  validateFields({
    group_name : groupName,
    role_id : roleId,
    label : newLabel,
    emoji : newEmoji
  }, discordFeedbackError.emoji, 'Fehler beim Aktualisieren der Rolle in Gruppe');
  try {
    await executeQuery('UPDATE', 'group_roles', {
      label: newLabel,
      emoji: newEmoji
    }, {
      group_name: groupName,
      role_id: roleId
    }, {
      target: 'group_name, role_id',
      action: 'NOTHING'
    });
    return createSuccessResponse(true, discordFeedbackSuccess.emoji, `Rolle ${roleId} in Gruppe ${groupName} erfolgreich aktualisiert.`);
  } catch (error) {
    logAndThrowError(discordFeedbackError.emoji, `Fehler beim Aktualisieren der Rolle ${roleId} in Gruppe ${groupName}`, error);
  }
}

// Hole Details einer Gruppe
export async function fetchGroupDetails(groupName, guildId) {
  validateFields({
    group_name : groupName,
    guild_id : guildId
  }, discordFeedbackError.emoji, `Fehler beim Abrufen der Details für Gruppe ${groupName} für Gilde ${guildId}`);
  try {
    const result = await executeQuery('SELECT', 'rolemenu_groups', {}, {
      group_name: groupName,
      guild_id: guildId
    }, {
      target: 'group_name, guild_id',
      action: 'NOTHING'
    });
    return createSuccessResponse(true, discordFeedbackSuccess.emoji, `Details für Gruppe ${groupName} erfolgreich abgerufen.`, result.rows[0]);
  } catch (error) {
    logAndThrowError(discordFeedbackError.emoji, `Fehler beim Abrufen der Details für Gruppe ${groupName} für Gilde ${guildId}`, error);
  }
}

// Entferne eine spezifische Rolle aus einer Gruppe
export async function removeRoleFromGroup(groupName, roleId, guildId) {
  validateFields({
    group_name : groupName,
    role_id : roleId,
    guild_id : guildId
  }, discordFeedbackError.emoji, `Fehler beim Entfernen der Rolle ${roleId} aus Gruppe ${groupName} für Gilde ${guildId}`);
  try {
    await executeQuery('DELETE', 'group_roles', {}, {
      role_id: roleId,
      group_name: groupName,
      guild_id: guildId
    }, {
      target: 'role_id, group_name, guild_id',
      action: 'NOTHING'
    });
    return createSuccessResponse(true, discordFeedbackSuccess.emoji, `Rolle ${roleId} aus Gruppe ${groupName} erfolgreich entfernt.`);
  } catch (error) {
    logAndThrowError(discordFeedbackError.emoji, `Fehler beim Entfernen der Rolle ${roleId} aus Gruppe ${groupName} für Gilde ${guildId}`, error);
  }
}
