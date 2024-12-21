module.exports = {
  config: {
    name: "spam",
    version: "1.0",
    author: "YourName",
    countDown: 5,
    role: 0,
    shortDescription: "Spam a message",
    longDescription: "Send the provided message multiple times, with a customizable amount.",
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
        // Extracting message and amount from the format "#spam|message|amount"
        let parts = event.body.slice(6).split("|");
        let messageToSpam = parts[0]; // The message to spam
        let amount = parseInt(parts[1]); // The amount of times to spam

        // Check if message and amount are valid
        if (!messageToSpam || isNaN(amount)) {
          return api.sendMessage("Please provide a valid message and amount. Example: #spam|hello|10", threadID);
        }

        // Function to send the message
        const sendMessage = (msg) => {
          api.sendMessage(msg, threadID);
        };

        // Start the spamming process
        let spamCount = 0;

        const spamInterval = setInterval(() => {
          if (spamCount >= amount) {
            clearInterval(spamInterval); // Stop the loop after the specified amount
            console.log(`Finished spamming ${amount} messages.`);
            api.sendMessage(`Done! Spammed ${amount} messages.`, threadID);
            return;
          }

          console.log(`Sending spam message ${spamCount + 1}`);
          sendMessage(messageToSpam); // Send message
          spamCount++;

        }, 100); // Delay of 100ms between messages

        console.log(`Started spamming: "${messageToSpam}" ${amount} times`);

      } catch (error) {
        console.error("Error during spam execution:", error);
        api.sendMessage("There was an error while spamming messages.", threadID);
      }
    }
  }
};