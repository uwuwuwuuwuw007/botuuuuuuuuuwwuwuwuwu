const axios = require("axios");
const fs = require("fs");
const path = require("path");

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

  onStart: async function () {},

  onChat: async function ({ event, message, api }) {
    if (event.logMessageType == "log:subscribe") {
      const { threadID } = event;
      const dataAddedParticipants = event.logMessageData.addedParticipants;

      // If the bot is added to the group
      if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
        try {
          // Send greeting message immediately
          const thankYouMessage = "Thank you for adding me to the group! 🎉";
          await message.send(thankYouMessage);

          // Define the Imgur video link
          const videoUrl = "https://i.imgur.com/TCuQx0p.mp4";
          const videoPath = path.join(__dirname, 'welcome-video.mp4');

          // Start downloading the video
          const response = await axios({
            url: videoUrl,
            method: "GET",
            responseType: "stream",
          });

          const writer = fs.createWriteStream(videoPath);

          // Pipe the video stream to a file
          response.data.pipe(writer);

          writer.on('finish', async () => {
            // Send the video once it's downloaded
            const form = {
              attachment: fs.createReadStream(videoPath),
            };
            await message.send(form);
          });

          writer.on('error', (error) => {
            console.error("Error saving video: ", error);
          });

        } catch (error) {
          console.error("Error handling subscription or downloading video:", error);
        }
      }
    }
  }
};