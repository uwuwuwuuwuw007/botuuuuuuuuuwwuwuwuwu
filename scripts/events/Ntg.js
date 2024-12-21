const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { getTime } = global.utils; // Importing getTime function

module.exports = {
  config: {
    name: "addEvent",
    version: "1.0",
    author: "Aayusha",
    category: "event",
  },

  onStart: async function () {},

  onChat: async function ({ event, api }) {
    const { threadID } = event;
    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
      api.changeNickname(`Aayuse's Bot`, threadID, api.getCurrentUserID());

      // Send greeting text
      api.sendMessage("Hello Everyone🙋‍♂️", event.threadID, async () => {
        try {
          // Get the current time using global.utils.getTime
          const currentTime = getTime("MM/DD/YYYY HH:mm:ss");

          // Define the Imgur video URL
          const videoUrl = "https://i.imgur.com/TCuQx0p.mp4"; // Change this to your Imgur URL
          const videoPath = path.join(__dirname, 'Aayusha.mp4'); // Temporary file path to save the video

          // Download the video from Imgur
          const response = await axios({
            url: videoUrl,
            method: "GET",
            responseType: "stream",
          });

          const writer = fs.createWriteStream(videoPath);
          response.data.pipe(writer);

          writer.on('finish', () => {
            // Once the video is downloaded, send the message with the video attached
            const messageText = `
----------------「𝗕𝗼𝘁𝗖𝗼𝗻𝗻𝗘𝗰𝘁𝗲𝗱」------------
[   Aayuse's Bot    ]
<><><><><><><><><><><><><>
♯» 𝗧𝗵𝗮𝗻𝗸𝘀 𝗙𝗼𝗿 𝗝𝗢𝗜𝗡𝗜𝗡𝗚 𝗠𝗘!!  
♯» 𝗕𝗼𝘁 𝗗𝗲𝘀𝗶𝗴𝗻𝗲𝗱 𝗯𝘆 𝗔𝗮𝘆𝘂𝘀𝗵𝗮
♯» 𝗢𝘄𝗻𝗲𝗿/𝗖𝗼𝗻𝘁𝗿𝗼𝗹𝗹𝗲𝗿: 𝗔𝗮𝘆𝘂𝘀𝗵𝗮
♯» 𝗔𝗱𝗺𝗶𝗻/𝗖𝗼𝗻𝘁𝗿𝗼𝗹𝘀: 𝗦𝘂𝗝𝗮𝗻𝗦𝗶𝗿
♯» 𝗘𝗱𝗶𝘁𝗲𝗱/𝗠𝗼𝗱𝗶𝗳𝗶𝗲𝗱 𝗕𝘆: 𝗦𝘂𝗝𝗮𝗻
♯» 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿: 𝗡𝗞𝗧𝗵𝗮𝗻𝗴
|» 𝘼𝙡𝙡 𝙍𝙞𝙜𝙝𝙩𝙨 𝙍𝙚𝙨𝙚𝙧𝙫𝙚𝙙
|» Please Do Not Spam While Bot Is In Your Thread!!
♯ Please Read #rule 
♯ If Bot Spamming Use #Rest
♯• 𝗦𝘂𝗝𝗮𝗻 ✘ 𝗔𝗮𝘆𝘂𝘀𝗲 ❤️👑
______________________________
Current Time: ${currentTime}`;

            api.sendMessage({
              body: messageText,
              attachment: fs.createReadStream(videoPath)
            }, threadID);
          });

          writer.on('error', (error) => {
            console.error("Error saving video:", error);
          });
        } catch (error) {
          console.error("Error downloading video:", error);
        }
      });
    }
  }
};