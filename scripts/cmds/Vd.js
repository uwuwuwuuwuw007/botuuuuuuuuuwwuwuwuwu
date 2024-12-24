const axios = require('axios');
const ytdl = require('ytdl-core');
const fs = require('fs');
const { getLang } = require('../utils/lang');

const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // Replace with your actual YouTube Data API key

async function searchYouTube(query) {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults: 1,
        q: query,
        key: AIzaSyBNxO-HaY3TEfwL0XNP9xS7Poqhmw58ZC8,
      },
    });

    const video = response.data.items[0];
    return {
      videoId: video.id.videoId,
      title: video.snippet.title,
      channel: video.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
    };
  } catch (error) {
    throw new Error('Failed to search YouTube for the video.');
  }
}

module.exports = {
  config: {
    name: 'sing',
    version: '1.0',
    description: 'Download and send audio of a song from YouTube',
    category: 'media',
    guide: {
      en: '{pn} [song_name]: Get audio of a song from YouTube.',
    },
  },

  onStart: async ({ args, message, getLang }) => {
    if (args.length === 0) {
      return message.reply(getLang('error', 'Please provide a song name.'));
    }

    const songName = args.join(' ');

    try {
      // Search for the song on YouTube
      const { videoId, title, url } = await searchYouTube(songName);

      // Get the audio stream of the video
      const audioStream = ytdl(`https://www.youtube.com/watch?v=${videoId}`, { filter: 'audioonly' });

      // Prepare file to send
      const audioPath = `./tmp/${videoId}.mp3`;
      const fileStream = fs.createWriteStream(audioPath);

      audioStream.pipe(fileStream);

      fileStream.on('finish', () => {
        // Send the audio file once it's ready
        message.reply({
          body: `🎵 Here's the audio for "${title}" from YouTube: ${url}`,
          attachment: fs.createReadStream(audioPath),
        }, () => {
          // Clean up the temporary file
          fs.unlinkSync(audioPath);
        });
      });
    } catch (error) {
      console.error(error);
      return message.reply(getLang('error', error.message));
    }
  },
};