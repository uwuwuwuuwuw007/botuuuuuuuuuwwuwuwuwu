let lastReplyIndexAayusha = null;
let lastReplyIndexAyusha = null;

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
    try {
      const id = event.senderID;
      const userData = await usersData.get(id);
      const name = userData.name;
      const ment = [{ id: id, tag: name }];

      // Helper function to get a random reply without repetition
      const getRandomReply = (replies, lastIndex) => {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * replies.length);
        } while (newIndex === lastIndex);
        return { reply: replies[newIndex], index: newIndex };
      };

      // Replies for "Aayusha"
      if (event.body && event.body.toLowerCase().includes("aayusha")) {
        const repliesForAayusha = [
          `${name}, She is Princess👑🌿`,
          `Hello, ${name}! Need something from the owner? Let me know. 🌟`,
          `${name}, My admin is busy😗⏳`,
          `${name}, Her servant here tell what's happened!?`,
          `${name}! Don't take my boss's Name!😒`,
        ];

        const { reply, index } = getRandomReply(repliesForAayusha, lastReplyIndexAayusha);
        lastReplyIndexAayusha = index;

        api.setMessageReaction("💬", event.messageID, () => {}, true);

        return message.reply({
          body: reply,
          mentions: ment,
        });
      }

      // Replies for "ayusha"
      if (event.body && event.body.toLowerCase().includes("ayusha")) {
        const repliesForAyusha = [
          `${name}! She is busy sir/miss!`,
          `${name}, Anything you want from my admin sir/miss?`,
          `${name}! Aayusha's Servant here tell me what happened!`,
        ];

        const { reply, index } = getRandomReply(repliesForAyusha, lastReplyIndexAyusha);
        lastReplyIndexAyusha = index;

        api.setMessageReaction("💬", event.messageID, () => {}, true);

        return message.reply({
          body: reply,
          mentions: ment,
        });
      }
    } catch (error) {
      console.error("Error setting reaction or sending reply:", error);
    }
  },
};