const { getTime } = global.utils;
const axios = require('axios');
const fs = require('fs');
const path = require('path');

if (!global.temp.welcomeEvent)
    global.temp.welcomeEvent = {};

module.exports = {
    config: {
        name: "welcome",
        version: "1.0",
        author: "Aayusha",
        category: "events"
    },

    langs: {
        en: {
            session1: "Morning",
            session2: "Noon",
            session3: "Afternoon",
            session4: "Evening",
            welcomeMessage: "Hi, I Am Proxiima.A Friendly ChatBot By Aayussha Shrestha and Luzzixy Supports Me As A Second Developer🤍",
            multiple1: "you",
            multiple2: "you guys"
        }
    },

    onStart: async ({ threadsData, message, event, api, getLang }) => {
        if (event.logMessageType == "log:subscribe")
            return async function () {
                const hours = getTime("HH");
                const { threadID } = event;
                const dataAddedParticipants = event.logMessageData.addedParticipants;

                // If new member:
                if (!global.temp.welcomeEvent[threadID])
                    global.temp.welcomeEvent[threadID] = {
                        joinTimeout: null,
                        dataAddedParticipants: []
                    };

                // Push new members to array
                global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
                clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

                // Set new timeout for welcome message
                global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
                    const threadData = await threadsData.get(threadID);
                    if (threadData.settings.sendWelcomeMessage == false) return;

                    const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
                    const userName = [];
                    let multiple = false;

                    // Handle multiple members joining
                    if (dataAddedParticipants.length > 1) multiple = true;

                    for (const user of dataAddedParticipants) {
                        userName.push(user.fullName);
                    }

                    // If no new members to greet, return
                    if (userName.length == 0) return;

                    // Get welcome message and session of the day
                    let { welcomeMessage = getLang("welcomeMessage") } = threadData.data;
                    welcomeMessage = welcomeMessage
                        .replace(/\{userName\}/g, userName.join(", "))
                        .replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
                        .replace(/\{session\}/g, hours <= 10 ? getLang("session1") :
                            hours <= 12 ? getLang("session2") :
                                hours <= 18 ? getLang("session3") : getLang("session4"));

                    const form = {
                        body: welcomeMessage
                    };

                    // Fetch the GIF from the URL
                    const gifUrl = 'https://i.imgur.com/88gxPJC.gif';  // Example GIF link
                    const gifPath = path.join(__dirname, 'welcome.gif');

                    try {
                        const response = await axios.get(gifUrl, { responseType: 'stream' });
                        const writer = fs.createWriteStream(gifPath);
                        response.data.pipe(writer);

                        writer.on('finish', () => {
                            form.attachment = fs.createReadStream(gifPath);
                            message.send(form);
                        });
                        writer.on('error', (error) => {
                            console.error("Error saving GIF: ", error);
                        });
                    } catch (error) {
                        console.error("Error downloading GIF: ", error);
                    }

                    delete global.temp.welcomeEvent[threadID];
                }, 1500);
            };
    }
}