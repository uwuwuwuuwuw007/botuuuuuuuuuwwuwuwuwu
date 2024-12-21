const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { getTime, drive } = global.utils;

module.exports = {
    config: {
        name: "leave",
        version: "1.5",
        author: "Aayusha",
        category: "events"
    },

    langs: {
        vi: {
            session1: "sÃ¡ng",
            session2: "trÆ°a",
            session3: "chiá»u",
            session4: "tá»‘i",
            leaveType1: "tá»± rá»i",
            leaveType2: "bá»‹ kick",
            defaultLeaveMessage: "{userName} Ä‘Ã£ {type} khá»i nhÃ³m"
        },
        en: {
            session1: "ðŒðŽð‘ððˆðð†",
            session2: "ððŽðŽð",
            session3: "ð€ð…ð“ð„ð‘ððŽðŽð",
            session4: "ð„ð•ð„ððˆðð†",
            leaveType1: "Left!!",
            leaveType2: "ð—žð—œð—–ð—žð—˜ð——!!ã€",
            defaultLeaveMessage: "{userName}, Sayonara🙋‍♂️"
        }
    },

    onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
        if (event.logMessageType == "log:unsubscribe") {
            const { threadID } = event;
            const threadData = await threadsData.get(threadID);
            if (!threadData.settings.sendLeaveMessage) return;

            const { leftParticipantFbId } = event.logMessageData;
            if (leftParticipantFbId == api.getCurrentUserID()) return;

            const hours = getTime("HH");
            const threadName = threadData.threadName;
            const userName = await usersData.getName(leftParticipantFbId);

            let { leaveMessage = getLang("defaultLeaveMessage") } = threadData.data;
            const form = {
                mentions: leaveMessage.match(/\{userNameTag\}/g) ? [{
                    tag: userName,
                    id: leftParticipantFbId
                }] : null
            };

            leaveMessage = leaveMessage
                .replace(/\{userName\}|\{userNameTag\}/g, userName)
                .replace(/\{type\}/g, leftParticipantFbId == event.author ? getLang("leaveType1") : getLang("leaveType2"))
                .replace(/\{threadName\}|\{boxName\}/g, threadName)
                .replace(/\{time\}/g, hours)
                .replace(/\{session\}/g, hours <= 10 ? getLang("session1") : hours <= 12 ? getLang("session2") : hours <= 18 ? getLang("session3") : getLang("session4"));

            form.body = leaveMessage;

            if (leaveMessage.includes("{userNameTag}")) {
                form.mentions = [{
                    id: leftParticipantFbId,
                    tag: userName
                }];
            }

            // Add GIF feature here
            const gifUrl = 'https://i.imgur.com/VbwXSLy.gif'; // Example GIF link
            const gifPath = path.join(__dirname, 'elcome.gif');

            try {
                const response = await axios.get(gifUrl, { responseType: 'stream' });
                const writer = fs.createWriteStream(gifPath);
                response.data.pipe(writer);

                writer.on('finish', async () => {
                    form.attachment = fs.createReadStream(gifPath);
                    message.send(form);
                });

                writer.on('error', (error) => {
                    console.error("Error saving GIF: ", error);
                });
            } catch (error) {
                console.error("Error downloading GIF: ", error);
                message.send(form); // Send message without GIF if download fails
            }
        }
    }
};