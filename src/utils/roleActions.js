// src/utils/roleActions.js
export async function addRole(member, roleId) {
  await member.roles.add(roleId);
  console.log(`Rolle ${roleId} zu ${member.user.tag} hinzugefügt.`);
}

export async function removeRole(member, roleId) {
  await member.roles.remove(roleId);
  console.log(`Rolle ${roleId} von ${member.user.tag} entfernt.`);
}
