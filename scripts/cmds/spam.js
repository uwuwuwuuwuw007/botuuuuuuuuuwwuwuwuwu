module.exports = {
  config: {
    name: "spam",
    version: "1.0",
    author: "YourName",
    countDown: 5,
    role: 0,
    shortDescription: "Send a message multiple times",
    longDescription: "This command sends the provided message 10 times when triggered.",
    category: "Utility",
  },

  onStart: async function() {},

  onChat: async function({ event, message, api }) {
    // Check if the message starts with "#spam "
    if (event.body && event.body.toLowerCase().startsWith("#spam ")) {
      try {
        // Extract the message to spam (everything after "#spam ")
        let spamMessage = event.body.slice(6); 

        // Send the spam message 10 times
        for (let i = 0; i < 10; i++) {
          await api.sendMessage({
            body: spamMessage,
            threadID: event.threadID,
          });
        }

        // Reply once to confirm the spam action
        message.reply({
          body: `Spamming the message: "${spamMessage}" 10 times.`,
        });
      } catch (error) {
        console.error("Error sending spam messages:", error);
      }
    }
  }
};