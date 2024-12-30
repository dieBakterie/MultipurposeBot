// src/services/Rolemenu/rolemenuStartCleanup.js
// Funktion: Cleanup-Intervall starten
export async function startRolemenuCleanup(db) {
  const now = new Date();
  const expiredSetups = await db.query(
    "SELECT message_id FROM active_setups WHERE expires_at <= $1",
    [now]
  );

  for (const setup of expiredSetups.rows) {
    if (activeSetups.has(setup.message_id)) {
      const { collector } = activeSetups.get(setup.message_id);
      collector.stop(); // Reaktionssammler beenden
      activeSetups.delete(setup.message_id); // Aus der Map entfernen
    }

    // Setup aus der Datenbank entfernen
    await db.query("DELETE FROM active_setups WHERE message_id = $1", [
      setup.message_id,
    ]);
    console.log(
      `Abgelaufenes Setup entfernt: Nachricht-ID ${setup.message_id}`
    );
  }
}
