module.exports = {
  config: {
    name: "spam",
    version: "1.0",
    author: "YourName",
    countDown: 5,
    role: 0,
    shortDescription: "Spam a message",
    longDescription: "Send the provided message multiple times (200 times).",
    category: "Utility",
  },

  onStart: async function() {
    // Any initialization needed can go here
  },

  onChat: async function({ event, api }) {
    var { threadID, messageID } = event;

    // Stop spamming if the message contains "#stopspam"
    if (event.body && event.body.toLowerCase().includes("#stopspam")) {
      api.sendMessage("Stopping the spam command.", threadID);
      return;
    }

    if (event.body && event.body.toLowerCase().startsWith("#spam ")) {
      try {
        let messageToSpam = event.body.slice(6); // Extract message after "#spam "
        
        if (!messageToSpam) {
          return api.sendMessage("Please provide a message to spam!", threadID);
        }

        // Function to send the message
        const sendMessage = (msg) => {
          api.sendMessage(msg, threadID);
        };

        // Start the spamming process
        let spamCount = 0;

        const spamInterval = setInterval(() => {
          if (spamCount >= 200) {
            clearInterval(spamInterval); // Stop the loop after 200 messages
            console.log("Finished spamming 200 messages.");
            api.sendMessage("Completed spamming 200 messages.", threadID);
            return;
          }

          console.log(`Sending spam message ${spamCount + 1}`);
          sendMessage(messageToSpam); // Send message
          spamCount++;

        }, 100); // Delay of 100ms between messages

        console.log(`Started spamming: "${messageToSpam}"`);

      } catch (error) {
        console.error("Error during spam execution:", error);
        api.sendMessage("There was an error while spamming messages.", threadID);
      }
    }
  }
};