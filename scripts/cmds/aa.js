let lastReplyIndexSoyek = null;
let lastReplyIndexsoyek = null;

module.exports = {
  config: {
    name: "callSoyek",
    version: "1.0",
    author: "Soyek Daii",
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

      // Replies for "Soyek"
      if (event.body && event.body.toLowerCase().includes("soyek")) {
        const repliesForSoyek = [
          `${name}, Yo Mero Daii Ho 🤷🏼‍♂️🙄`,
          `Hello, ${name}! Mero Dai Sanga Kei Vannu parne thiyo ki? Malai Van. 🌟`,
          `${name}, Mero Dai Bg Xa Ekxin la😗⏳`,
          `${name}, Katti dai lai matra khojxau maiiya hami sojo ko chai man haina ra🤭!?`,
          `${name}! Mero Daii Ko Nam Nali Ta Tero Mukh Bata!😒`,
        ];

        const { reply, index } = getRandomReply(repliesForSoyek, lastReplyIndexSoyek);
        lastReplyIndexSoyek = index;

        api.setMessageReaction("💬", event.messageID, () => {}, true);

        return message.reply({
          body: reply,
          mentions: ment,
        });
      }

      // Replies for "soyek"
      if (event.body && event.body.toLowerCase().includes("soyek")) {
        const repliesForSoyek = [
          `${name}! Mero Dai Bg Xa Ekxin Uncle hoki Aunty ho🙄`,
          `${name}, Ekxin hau katti hatar vako kei thiyo vane malai van?`,
          `${name}! Soyek Dai ko vai ho malai vanda pani kei hunna hau!`,
        ];

        const { reply, index } = getRandomReply(repliesForSoyek, lastReplyIndexSoyek);
        lastReplyIndexSoyek = index;

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
