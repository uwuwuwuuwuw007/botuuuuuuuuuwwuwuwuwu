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
                    // Fetch the video from the Imgur URL
                    const videoUrl = 'https://i.imgur.com/JyyfDrC.mp4';  // Example video URL from Imgur
                    const videoPath = path.join(__dirname, 'welcome-video.mp4');

                    try {
                        // Start downloading the video
                        const response = await axios.get(videoUrl, { responseType: 'stream' });
                        const writer = fs.createWriteStream(videoPath);
                        
                        // Wait until the video download is finished
                        writer.on('finish', async () => {
                            // Once the video is downloaded, send the greeting text
                            const welcomeMessage = getLang("welcomeMessage");
                            await message.send(welcomeMessage);

                            // Now send the video
                            const form = {
                                attachment: fs.createReadStream(videoPath)
                            };
                            await message.send(form);  // Send video once it's ready
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