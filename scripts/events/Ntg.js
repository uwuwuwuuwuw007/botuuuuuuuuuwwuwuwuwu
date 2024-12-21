const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { getTime } = global.utils; // Importing getTime function

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
♯» 𝗧𝗵𝗮𝗻𝗸𝘀 𝗙𝗼𝗿 𝗝𝗼𝗶𝗻𝗶𝗻𝗴 𝗠𝗲!!  
♯» 𝗕𝗼𝘁 𝗗𝗲𝘀𝗶𝗴𝗻𝗲𝗱 𝗯𝘆 𝗔𝗮𝘆𝘂𝘀𝗵𝗮
♯» 𝗢𝘄𝗻𝗲𝗿/𝗖𝗼𝗻𝘁𝗿𝗼𝗹𝗹𝗲𝗿: 𝗔𝗮𝘆𝘂𝘀𝗵𝗮
♯» 𝗔𝗱𝗺𝗶𝗻/𝗖𝗼𝗻𝘁𝗿𝗼𝗹𝘀: 𝗦𝘂𝗝𝗮𝗻𝗦𝗶𝗿
♯» 𝗘𝗱𝗶𝘁𝗲𝗱/𝗠𝗼𝗱𝗶𝗳𝗶𝗲𝗱 𝗕𝘆: 𝗦𝘂𝗝𝗮𝗻
♯» 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿: 𝗡𝗞𝗧𝗵𝗮𝗻𝗴
|