module.exports = {
  config: {
    name: "spam",
    version: "1.0",
    author: "YourName",
    countDown: 5,
    role: 0,
    shortDescription: "Spam a message",
    longDescription: "Send the provided message multiple times with a customizable amount.",
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
        // Extracting the parts from the message using space as the separator
        let parts = event.body.slice(6).split(" ");

        // The first part is the message, the second is the amount to send
        let messageToSpam = parts.slice(0, parts.length - 1).join(" "); // Join the message parts back if there are spaces in the message
        let amount = parseInt(parts[parts.length - 1]); // Last part is the amount

        // Validate input
        if (!messageToSpam || isNaN(amount) || amount <= 0) {
          return api.sendMessage("Please provide a valid message and amount. Example: #spam hello 10", threadID);
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