module.exports = {
  config: {
    name: "callAayusha",
    version: "1.0",
    author: "Aayusha",
    countDown: 5,
    role: 0,
    shortDescription: "no prefix",
    longDescription: "no prefix",
    category: "no prefix",
  },

  onStart: async function () {},

  onChat: async function ({ event, message, api, usersData }) {
    if (event.body && event.body.toLowerCase().includes("proxima")) {
      try {
        const id = event.senderID;
        const userData = await usersData.get(id);
        const name = userData.name;
        const ment = [{ id: id, tag: name }];

        const replies = [
          `${name}, She is Princess👑🌿`,
          `Hello, ${name}! Need something from the ownner? Let me know. 🌟`,
          ` ${name}, My admin is busy😗⏳`,
          `${name}, Her servant here tell what's happened!?`,
          `${name}! Don't take my boss's Name!😒`,
        ];

        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        api.setMessageReaction("💋", event.messageID, () => {}, true);

        return message.reply({
          body: randomReply,
          mentions: ment,
        });
      } catch (error) {
        console.error("Error setting reaction or sending reply:", error);
      }
    }
  },
};