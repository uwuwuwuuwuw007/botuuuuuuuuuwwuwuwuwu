const fs = require("fs-extra");
const ytdl = require("@distube/ytdl-core");
const yts = require("yt-search");
const axios = require('axios');
const tinyurl = require('tinyurl');

// Read cookies from a file and parse them into the correct format
const cookieData = fs.readFileSync('./cookies.txt', 'utf-8');
const cookies = cookieData.split(';').map(cookie => {
  const [name, value] = cookie.trim().split('=');
  return { name, value };
});

// (Optional) You can set agent options if needed
const agentOptions = {
  pipelining: 5,
  maxRedirections: 0,
  localAddress: "127.0.0.1",
};

// Create the agent using cookies and agent options
const agent = ytdl.createAgent(cookies, agentOptions);

module.exports = {
  config: {
    name: "sing",
    version: "1.3",
    author: "JARiF",
    countDown: 5,
    role: 0,
    category: "cute",
  },

  onStart: async function ({ api, event, message }) {
    try {
      const input = event.body;
      const song = input.substring(12).trim();
      const originalMessage = await message.reply(`Searching your song named "${song}"...`);
      const searchResults = await yts(song);

      if (!searchResults.videos.length) {
        return message.reply("Error: Invalid request.");
      }

      const video = searchResults.videos[0];
      const videoUrl = video.url;

      // Pass the agent to ytdl
      const stream = ytdl(videoUrl, {
        filter: "audioonly",
        agent,  // Use the agent created with cookies
      });

      const fileName = `music.mp3`;
      const filePath = `${__dirname}/tmp/${fileName}`;

      stream.pipe(fs.createWriteStream(filePath));

      stream.on('response', () => {
        console.info('[DOWNLOADER]', 'Starting download now!');
      });

      stream.on('info', (info) => {
        console.info('[DOWNLOADER]', `Downloading ${info.videoDetails.title} by ${info.videoDetails.author.name}`);
      });

      stream.on('end', async () => {
        console.info('[DOWNLOADER] Downloaded');
        if (fs.statSync(filePath).size > 26214400) {
          fs.unlinkSync(filePath);
          return message.reply('[ERR] The file could not be sent because it is larger than 25MB.');
        }
        const replyMessage = {
          body: `Title: ${video.title}\nArtist: ${video.author.name}`,
          attachment: fs.createReadStream(filePath),
        };
        await api.unsendMessage(originalMessage.messageID);
        await message.reply(replyMessage, event.threadID, () => {
          fs.unlinkSync(filePath);
        });
      });
    } catch (error) {
      console.error('[ERROR]', error);
      message.reply("This song is not available.");
    }
  },
};