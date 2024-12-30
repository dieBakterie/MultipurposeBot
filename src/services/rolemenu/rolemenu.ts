// src/services/rolemenu/rolemenu.ts
lemenu/rolemenu.js
/// sollte der bot abstürzen oder neugestartet werden, wird das setup wiederhergestellt
const activeSetups = new Map(); // Map für aktive Setups
const SETUP_TIMEOUT = 10 * 60 * 1000; // 10 Minuten Timeout für Setups

// Funktion: Rolemenus wiederherstellen
export async function restoreRolemenus(client, db) {
  console.log("Wiederherstellung aktiver Rolemenus gestartet...");

  const activeSetupsFromDb = await db.query(
    "SELECT message_id, channel_id FROM active_setups"
  );
  for (const setup of activeSetupsFromDb.rows) {
    try {
      const channel = await client.channels.fetch(setup.channel_id);
      const message = await channel.messages.fetch(setup.message_id);

      const collector = message.createReactionCollector({
        filter: (reaction, user) => !user.bot,
      });
      activeSetups.set(message.id, {
        collector,
        timeout: Date.now() + SETUP_TIMEOUT,
      });

      // Collector-Logik
      collector.on("collect", async (reaction, user) => {
        const emoji = reaction.emoji.name;

        const roleResponse = await channel.awaitMessages({
          filter: (msg) => msg.author.id === user.id,
          max: 1,
          time: 60 * 1000,
        });

        const role = roleResponse.first().mentions.roles.first();
        if (!role) {
          await user.send("Ungültige Rolle. Bitte erneut versuchen.");
          return;
        }

        await db.query(
          "INSERT INTO rolemenu_roles (rolemenu_id, emoji, role_id) VALUES ((SELECT id FROM rolemenus WHERE message_id = $1), $2, $3)",
          [message.id, emoji, role.id]
        );

        await user.send(
          `Emoji **${emoji}** wurde mit der Rolle <@&${role.id}> verknüpft.`
        );
      });
    } catch (error) {
      console.error(
        `Fehler beim Wiederherstellen eines Setups: ${error.message}`
      );

      // Cleanup ungültiger Setups
      await db.query("DELETE FROM active_setups WHERE message_id = $1", [
        setup.message_id,
      ]);
      console.log(
        `Ungültiges Setup entfernt: Nachricht-ID ${setup.message_id}`
      );
    }
  }

  console.log("Wiederherstellung aktiver Rolemenus abgeschlossen.");
}
