export default {
  name: "messageCreate",
  async execute(message, client) {
    // Ignoriere Nachrichten von Bots
    if (message.author.bot) return;

    console.log(
      `${message.author.tag} hat eine Nachricht gesendet: ${message.content}`
    );

    // Überprüfe, ob eine Nachricht Teil eines erwarteten Workflows ist
    if (client.expectedMessages?.has(message.author.id)) {
      const { resolve } = client.expectedMessages.get(message.author.id);

      // Die Nachricht an den Workflow weitergeben
      resolve(message);
      client.expectedMessages.delete(message.author.id);
    }
  },
};
