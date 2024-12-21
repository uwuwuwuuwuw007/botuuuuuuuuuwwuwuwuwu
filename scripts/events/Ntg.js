const { getTime } = global.utils;
const axios = require('axios');
const fs = require('fs');
const path = require('path');

if (!global.temp.welcomeEvent)
    global.temp.welcomeEvent = {};

module.exports = {
    config: {
        name: "addEvent",
        version: "1.0",
        author: "Aayusha",
        category: "events"
    },

    onStart: async ({ threadsData, message, event, api, getLang }) => {
        if (event.logMessageType == "log:subscribe")
            return async function () {
                const { threadID } = event;
                const dataAddedParticipants = event.logMessageData.addedParticipants;

                // If the bot is added to the group
                if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
                    // Define the path where the video will be saved
                    const videoUrl = 'https://i.imgur.com/JyyfDrC.mp4';  // Example video URL from Imgur
                    const videoPath = path.join(__dirname, 'welcome-video.mp4');

                    try {
                        // First, download the video and save it
                        const response = await axios({
                            url: videoUrl,
                            method: 'GET',
                            responseType: 'stream'
                        });

                        // Create a write stream to save the video
                        const writer = fs.createWriteStream(videoPath);
                        response.data.pipe(writer);

                        // Wait for the video download to complete
                        writer.on('finish', () => {
                            // Send the video first
                            const form = {
                                attachment: fs.createReadStream(videoPath)
                            };
                            message.send(form);

                            // Now send the greeting message (this will be the last part)
                            const welcomeMessage = "Hi, I Am Proxiima. A Friendly ChatBot By Aayussha Shrestha and Luzzixy Supports Me As A Second Developer🤍";
                            message.send(welcomeMessage);
                        });

                        writer.on('error', (error) => {
                            console.error("Error saving video: ", error);
                        });
                    } catch (error) {
                        console.error("Error downloading video: ", error);
                    }
                }
            };
    }
}