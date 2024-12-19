const fs = require("fs");

module.exports = {
  config: {
    name: "Aayushaa",
    version: "1.0",
    author: "AceGun",
    countDown: 5,
    role: 0,
    shortDescription: "no prefix",
    longDescription: "no prefix",
    category: "no prefix",
  },

  onStart: async function() {},

  onChat: async function({ event, message, api, getLang }) {
    if (event.body && event.body.toLowerCase().includes("owner")) {
      try {
        // Set reaction to the message
        api.setMessageReaction("ðŸ’‹", event.messageID, () => {}, true);

        return message.reply({
          body: "Hi, I am PrÅxima. Developed by Miss AÃ yusha Shrestha and my Second developer is Luzzixy.🌿🤍",
          attachment: fs.createReadStream("owner.mp4")
        });
      } catch (error) {
        console.error("Error setting reaction or sending reply:", error);
      }
    }
  }
}