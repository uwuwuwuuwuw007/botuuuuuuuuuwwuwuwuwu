const axios = require('axios');
const fs = require('fs-extra'); // Use fs-extra for advanced file operations
const { getTime } = global.utils;

module.exports = {
  config: {
    name: "addEvent",
    version: "1.0",
    author: "Aayusha",
    category: "events",
  },

  onStart: async ({ threadsData, message, event, api, getLang }) => {
    if (event.logMessageType == "log:subscribe") {
      const { threadID } = event;
      const dataAddedParticipants = event.logMessageData.addedParticipants;

      // If the bot is added to the group
      if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
        // Send greeting message immediately
        const welcomeMessage = getLang("welcomeMessage");
        message.send(welcomeMessage);

        // Define video URL and file path
        const videoUrl = 'https://i.imgur.com/JyyfDrC.mp4'; // Example Imgur URL
        const videoPath = './cache/joinmp4/Aayusha.mp4'; // Path where video will be saved

        // Ensure the directory exists
        await fs.ensureDir('./cache/joinmp4'); // Ensure directory exists

        try {
          // Download the video using axios
          const response = await axios({
            url: videoUrl,
            method: 'GET',
            responseType: 'stream',
          });

          // Save the video to disk
          const writer = fs.createWriteStream(videoPath);
          response.data.pipe(writer);

          // Once the download is complete, send the video and message
          writer.on('finish', () => {
            // Send the message and video attachment
            message.send({
              body: "Thank you for adding me to the group! Here is a video 🎉",
              attachment: fs.createReadStream(videoPath),
            });
          });

          writer.on('error', (error) => {
            console.error("Error saving video: ", error);
          });
        } catch (error) {
          console.error("Error downloading video: ", error);
        }
      }
    }
  },
};