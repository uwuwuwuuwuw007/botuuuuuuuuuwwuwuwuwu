const fs = require("fs-extra");
const axios = require("axios");
const cheerio = require("cheerio");
const qs = require("qs");
const { getStreamFromURL, randomString } = global.utils;

function loadAutoLinkStates() {
  try {
    const data = fs.readFileSync("autolink.json", "utf8");
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

function saveAutoLinkStates(states) {
  fs.writeFileSync("autolink.json", JSON.stringify(states, null, 2));
}

let autoLinkStates = loadAutoLinkStates();

async function shortenURL(url) {
  try {
    const response = await axios.get(`https://shortner-sepia.vercel.app/kshitiz?url=${encodeURIComponent(url)}`);
    return response.data.shortened;
  } catch (error) {
    console.error("Error shortening URL:", error);
    throw new Error("Failed to shorten URL");
  }
}

module.exports = {
  threadStates: {},
  config: {
    name: 'autolink',
    version: '5.0',
    author: 'Vex_Kshitiz',
    countDown: 5,
    role: 0,
    shortDescription: 'Auto video downloader for Instagram, Facebook, TikTok, Twitter, Pinterest, and YouTube',
    longDescription: '',
    category: 'media',
    guide: {
      en: '{p}{n}',
    }
  },
  onStart: async function ({ api, event }) {
    const threadID = event.threadID;

    if (!autoLinkStates[threadID]) {
      autoLinkStates[threadID] = 'on';
      saveAutoLinkStates(autoLinkStates);
    }

    if (!this.threadStates[threadID]) {
      this.threadStates[threadID] = {};
    }

    if (event.body.toLowerCase().includes('autolink off')) {
      autoLinkStates[threadID] = 'off';
      saveAutoLinkStates(autoLinkStates);
      api.sendMessage("AutoLink is now turned off for this chat.", event.threadID, event.messageID);
    } else if (event.body.toLowerCase().includes('autolink on')) {
      autoLinkStates[threadID] = 'on';
      saveAutoLinkStates(autoLinkStates);
      api.sendMessage("AutoLink is now turned on for this chat.", event.threadID, event.messageID);
    }
  },
  onChat: async function ({ api, event }) {
    const threadID = event.threadID;

    if (this.checkLink(event.body)) {
      const { url } = this.checkLink(event.body);
      console.log(`Attempting to download from URL: ${url}`);
      if (autoLinkStates[threadID] === 'on' || !autoLinkStates[threadID]) {
        this.downLoad(url, api, event);
      } else {
        api.sendMessage("", event.threadID, event.messageID);
      }
      api.setMessageReaction("🕐", event.messageID, (err) => {}, true);
    }
  },
  downLoad: function (url, api, event) {
    const time = Date.now();
    const path = __dirname + `/cache/${time}.mp4`;

    if (url.includes("instagram")) {
      this.downloadInstagram(url, api, event, path);
    } else if (url.includes("facebook") || url.includes("fb.watch")) {
      this.downloadFacebook(url, api, event, path);
    } else if (url.includes("tiktok")) {
      this.downloadTikTok(url, api, event, path);
    } else if (url.includes("x.com")) {
      this.downloadTwitter(url, api, event, path);
    } else if (url.includes("pin.it")) {
      this.downloadPinterest(url, api, event, path);
    } else if (url.includes("youtu")) {
      this.downloadYouTube(url, api, event, path);
    }
  },
  downloadInstagram: async function (url, api, event, path) {
    try {
      const res = await this.getLink(url, api, event, path);
      console.log(`Instagram Video URL: ${res}`);  // Log the URL to debug

      if (!res) {
        return api.sendMessage("Sorry, unable to fetch the video URL.", event.threadID, event.messageID);
      }

      const response = await axios({
        method: "GET",
        url: res,
        responseType: "arraybuffer"
      });

      fs.writeFileSync(path, Buffer.from(response.data, "utf-8"));
      if (fs.statSync(path).size / 1024 / 1024 > 25) {
        return api.sendMessage("The file is too large, cannot be sent", event.threadID, () => fs.unlinkSync(path), event.messageID);
      }

      const shortUrl = await shortenURL(res);
      const messageBody = `✅ 🔗 Download Url: ${shortUrl}`;
      api.sendMessage({
        body: messageBody,
        attachment: fs.createReadStream(path)
      }, event.threadID, () => fs.unlinkSync(path), event.messageID);
    } catch (err) {
      console.error("Instagram Download Error:", err);
      api.sendMessage("An error occurred while downloading from Instagram.", event.threadID, event.messageID);
    }
  },
  downloadFacebook: async function (url, api, event, path) {
    try {
      const res = await fbDownloader(url);
      console.log('Facebook API Response:', res);  // Log the response to debug

      if (res.success && res.download && res.download.length > 0) {
        const videoUrl = res.download[0].url;
        const response = await axios({
          method: "GET",
          url: videoUrl,
          responseType: "stream"
        });

        if (response.headers['content-length'] > 87031808) {
          return api.sendMessage("The file is too large, cannot be sent", event.threadID, () => fs.unlinkSync(path), event.messageID);
        }
        response.data.pipe(fs.createWriteStream(path));
        response.data.on('end', async () => {
          const shortUrl = await shortenURL(videoUrl);
          const messageBody = `✅🔗 Download Url: ${shortUrl}`;

          api.sendMessage({
            body: messageBody,
            attachment: fs.createReadStream(path)
          }, event.threadID, () => fs.unlinkSync(path), event.messageID);
        });
      } else {
        api.sendMessage("Unable to fetch the video from Facebook.", event.threadID, event.messageID);
      }
    } catch (err) {
      console.error('Facebook Download Error:', err);
      api.sendMessage("An error occurred while downloading from Facebook.", event.threadID, event.messageID);
    }
  },
  downloadTikTok: async function (url, api, event, path) {
    try {
      const res = await axios.get(`https://tikdl-video.vercel.app/tiktok?url=${encodeURIComponent(url)}`);
      console.log('TikTok API Response:', res.data);  // Log the response to debug

      if (res.data.videoUrl) {
        const videoUrl = res.data.videoUrl;
        const response = await axios({
          method: "GET",
          url: videoUrl,
          responseType: "stream"
        });

        if (response.headers['content-length'] > 87031808) {
          return api.sendMessage("The file is too large, cannot be sent", event.threadID, () => fs.unlinkSync(path), event.messageID);
        }

        response.data.pipe(fs.createWriteStream(path));
        response.data.on('end', async () => {
          const shortUrl = await shortenURL(videoUrl);
          const messageBody = `✅🔗 Download Url: ${shortUrl}`;

          api.sendMessage({
            body: messageBody,
            attachment: fs.createReadStream(path)
          }, event.threadID, () => fs.unlinkSync(path), event.messageID);
        });
      } else {
        api.sendMessage("Unable to fetch the video from TikTok.", event.threadID, event.messageID);
      }
    } catch (err) {
      console.error('TikTok Download Error:', err);
      api.sendMessage("An error occurred while downloading from TikTok.", event.threadID, event.messageID);
    }
  },
  downloadTwitter: async function (url, api, event, path) {
    try {
      const res = await axios.get(`https://xdl-twitter.vercel.app/kshitiz?url=${encodeURIComponent(url)}`);
      const videoUrl = res.data.videoUrl;

      if (!videoUrl) {
        return api.sendMessage("Unable to fetch the video from Twitter.", event.threadID, event.messageID);
      }

      const response = await axios({
        method: "GET",
        url: videoUrl,
        responseType: "stream"
      });

      if (response.headers['content-length'] > 87031808) {
        return api.sendMessage("The file is too large, cannot be sent", event.threadID, () => fs.unlinkSync(path), event.messageID);
      }

      response.data.pipe(fs.createWriteStream(path));
      response.data.on('end', async () => {
        const shortUrl = await shortenURL(videoUrl);
        const messageBody = `✅🔗 Download Url: ${shortUrl}`;

        api.sendMessage({
          body: messageBody,
          attachment: fs.createReadStream(path)
        }, event.threadID, () => fs.unlinkSync(path), event.messageID);
      });
    } catch (err) {
      console.error('Twitter Download Error:', err);
      api.sendMessage("An error occurred while downloading from Twitter.", event.threadID, event.messageID);
    }
  },
  checkLink: function (url) {
    if (
      url.includes("instagram") ||
      url.includes("facebook") ||
      url.includes("fb.watch") ||
      url.includes("tiktok") ||
      url.includes("x.com") ||
      url.includes("pin.it") ||
      url.includes("youtu")
    ) {
      return { url: url };
    }

    const fbWatchRegex = /fb\.watch\/[a-zA-Z0-9_-]+/i;
    if (fbWatchRegex.test(url)) {
      return { url: url };
    }

    return null;
  },
};

async function fbDownloader(url) {
  try {
    const response1 = await axios({
      method: 'POST',
      url: 'https://snapsave.app/action.php?lang=vn',
      headers: {
        "accept": "*/*",
        "accept-language": "vi,en-US;q=0.9,en;q=0.8",
        "content-type": "multipart/form-data",
      },
      data: { url }
    });

    let html;
    const evalCode = response1.data.replace('return decodeURIComponent', 'html = decodeURIComponent');
    eval(evalCode);
    html = html.split('innerHTML = "')[1].split('";')[0];
    return JSON.parse(html);
  } catch (err) {
    console.error("Error fetching Facebook video:", err);
    throw new Error("Error fetching Facebook video");
  }
}