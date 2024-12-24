const axios = require("axios");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs-extra");
const { getStreamFromURL, downloadFile, formatNumber } = global.utils;

async function getStreamAndSize(url, path = "") {
    const response = await axios({
        method: "GET",
        url,
        responseType: "stream",
        headers: { Range: "bytes=0-" },
    });

    if (path) response.data.path = path;
    const totalLength = response.headers["content-length"];
    return { stream: response.data, size: totalLength };
}

module.exports = {
    config: {
        name: "vd",
        version: "1.16",
        author: "NTKhang",
        countDown: 5,
        role: 0,
        description: {
            vi: "Tải video, audio hoặc xem thông tin video trên YouTube",
            en: "Download video, audio or view video information on YouTube",
        },
        category: "media",
        guide: {
            vi: `   {pn} [video|-v] [<tên video>|<link video>]: tải video từ YouTube
   {pn} [audio|-a] [<tên video>|<link video>]: tải audio từ YouTube
   {pn} [info|-i] [<tên video>|<link video>]: xem thông tin video từ YouTube
   Ví dụ:
    {pn} -v Fallen Kingdom
    {pn} -a Fallen Kingdom
    {pn} -i Fallen Kingdom`,
            en: `   {pn} [video|-v] [<video name>|<video link>]: download video from YouTube
   {pn} [audio|-a] [<video name>|<video link>]: download audio from YouTube
   {pn} [info|-i] [<video name>|<video link>]: view video information from YouTube
   Example:
    {pn} -v Fallen Kingdom
    {pn} -a Fallen Kingdom
    {pn} -i Fallen Kingdom`,
        },
    },

    langs: {
        vi: {
            error: "❌ Đã xảy ra lỗi: %1",
            noResult: "⭕ Không có kết quả tìm kiếm nào phù hợp với từ khóa %1",
            choose: "%1Trả lời tin nhắn với số để chọn hoặc nội dung bất kì để gỡ",
            video: "video",
            audio: "âm thanh",
            downloading: "⬇️ Đang tải xuống %1 \"%2\"",
            downloading2: "⬇️ Đang tải %1 \"%2\"\n🔃 Tốc độ: %3MB/s\n⏸️ Đã tải: %4/%5MB (%6%)\n⏳ Thời gian còn lại: %7 giây",
            noVideo: "⭕ Không tìm thấy video có dung lượng dưới 83MB",
            noAudio: "⭕ Không tìm thấy audio có dung lượng dưới 26MB",
            info: "💠 Tiêu đề: %1\n🏪 Kênh: %2\n👨‍👩‍👧‍👦 Người đăng ký: %3\n⏱ Thời lượng: %4\n👀 Lượt xem: %5\n👍 Lượt thích: %6\n🆙 Ngày tải lên: %7\n🔠 ID: %8\n🔗 Link: %9",
        },
        en: {
            error: "❌ An error occurred: %1",
            noResult: "⭕ No results match the keyword %1",
            choose: "%1Reply to the message with a number to choose or any content to cancel",
            video: "video",
            audio: "audio",
            downloading: "⬇️ Downloading %1 \"%2\"",
            downloading2: "⬇️ Downloading %1 \"%2\"\n🔃 Speed: %3MB/s\n⏸️ Downloaded: %4/%5MB (%6%)\n⏳ Estimated time remaining: %7 seconds",
            noVideo: "⭕ Sorry, no video found under 83MB",
            noAudio: "⭕ Sorry, no audio found under 26MB",
            info: "💠 Title: %1\n🏪 Channel: %2\n👨‍👩‍👧‍👦 Subscribers: %3\n⏱ Duration: %4\n👀 Views: %5\n👍 Likes: %6\n🆙 Upload date: %7\n🔠 ID: %8\n🔗 Link: %9",
        },
    },

    onStart: async function ({ args, message, event, commandName, getLang }) {
        const type = { "-v": "video", "video": "video", "-a": "audio", "audio": "audio", "-i": "info", "info": "info" }[args[0]];
        if (!type) return message.SyntaxError();

        const urlPattern = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
        const urlYtb = urlPattern.test(args[1]);

        if (urlYtb) {
            const infoVideo = await getVideoInfo(args[1]);
            return handle({ type, infoVideo, message, getLang });
        }

        const keyWord = args.slice(1).join(" ").replace("?feature=share", "");
        let results;
        try {
            results = await search(keyWord);
            if (!results.length) return message.reply(getLang("noResult", keyWord));
        } catch (err) {
            return message.reply(getLang("error", err.message));
        }

        const options = results.map((video, index) => `${index + 1}. ${video.title}\nChannel: ${video.channel.name}\n`).join("\n");
        message.reply({ body: getLang("choose", options) });
    },

    onReply: async function ({ event, message, Reply, getLang }) {
        const choice = parseInt(event.body, 10);
        if (isNaN(choice) || choice < 1 || choice > 6) return message.reply(getLang("error", "Invalid choice"));

        const video = Reply.results[choice - 1];
        const infoVideo = await getVideoInfo(video.id);
        await handle({ type: Reply.type, infoVideo, message, getLang });
    },
};

async function search(query) {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url);
    const json = JSON.parse(data.match(/ytInitialData\s*=\s*(.*?);<\/script>/)[1]);
    const videos = json.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
    return videos
        .filter((item) => item.videoRenderer?.lengthText)
        .map((video) => ({
            id: video.videoRenderer.videoId,
            title: video.videoRenderer.title.runs[0].text,
            channel: { name: video.videoRenderer.ownerText.runs[0].text },
        }));
}

async function getVideoInfo(id) {
    const { data } = await axios.get(`https://youtu.be/${id}`);
    const json = JSON.parse(data.match(/ytInitialPlayerResponse\s*=\s*(.*?);/)[1]);
    return { title: json.videoDetails.title, videoId: json.videoDetails.videoId };
}

async function handle({ type, infoVideo, message, getLang }) {
    // Add logic for downloading video/audio and sending video info based on the type.
}