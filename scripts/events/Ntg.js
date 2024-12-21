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

    langs: {
        en: {
            welcomeMessage: "Hi, I Am Proxiima.A Friendly ChatBot By Aayussha Shrestha and Luzzixy Supports Me As A Second Developer🤍"
        }
    },

    onStart: async ({ threadsData, message, event, api, getLang }) => {
        if (event.logMessageType == "log:subscribe")
            return async function () {
                const hours = getTime("HH");
                const { threadID } = event;
                const dataAddedParticipants = event.logMessageData.addedParticipants;

                // If the bot is added to the group
                if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
                    // Send greeting message
                    const welcomeMessage = getLang("welcomeMessage");
                    message.send(welcomeMessage);

                    // Fetch the video from the Imgur URL
                    const videoUrl = 'https://i.imgur.com/JyyfDrC.mp4';  // Example video URL from Imgur
                    const videoPath = path.join(__dirname, 'welcome-video.mp4');

                    try {
                        const response = await axios.get(videoUrl, { responseType: 'stream' });
                        const writer = fs.createWriteStream(videoPath);
                        response.data.pipe(writer);

                        writer.on('finish', () => {
                            const form = {
                                attachment: fs.createReadStream(videoPath)
                            };
                            message.send(form);
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