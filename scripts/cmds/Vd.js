const axios = require("axios");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs-extra");
const { getStreamFromURL, downloadFile, formatNumber } = global.utils;

async function getStreamAndSize(url, path = "") {
    const response = await axios({
        method: "GET",
        url,
        responseType: "stream",
        headers: {
            'Range': 'bytes=0-'
        }
    });
    if (path) response.data.path = path;
    const totalLength = response.headers["content-length"];
    return {
        stream: response.data,
        size: totalLength
    };
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
            en: "Download video, audio or view video information on YouTube"
        },
        category: "media",
        guide: {
            vi: "   {pn} [video|-v] [<tên video>|<link video>]: dùng để tải video từ youtube."
                + "\n   {pn} [audio|-a] [<tên video>|<link video>]: dùng để tải audio từ youtube"
                + "\n   {pn} [info|-i] [<tên video>|<link video>]: dùng để xem thông tin video từ youtube"
                + "\n   Ví dụ:"
                + "\n    {pn} -v Fallen Kingdom"
                + "\n    {pn} -a Fallen Kingdom"
                + "\n    {pn} -i Fallen Kingdom",
            en: "   {pn} [video|-v] [<video name>|<video link>]: use to download video from youtube."
                + "\n   {pn} [audio|-a] [<video name>|<video link>]: use to download audio from youtube"
                + "\n   {pn} [info|-i] [<video name>|<video link>]: use to view video information from youtube"
                + "\n   Example:"
                + "\n    {pn} -v Fallen Kingdom"
                + "\n    {pn} -a Fallen Kingdom"
                + "\n    {pn} -i Fallen Kingdom"
        }
    },

    langs: {
        vi: {
            error: "❌ Đã xảy ra lỗi: %1",
            noResult: "⭕ Không có kết quả tìm kiếm nào phù hợp với từ khóa %1",
            choose: "%1Reply tin nhắn với số để chọn hoặc nội dung bất kì để gỡ",
            video: "video",
            audio: "âm thanh",
            downloading: "⬇️ Đang tải xuống %1 \"%2\"",
            downloading2: "⬇️ Đang tải xuống %1 \"%2\"\n🔃 Tốc độ: %3MB/s\n⏸️ Đã tải: %4/%5MB (%6%)\n⏳ Ước tính thời gian còn lại: %7 giây",
            noVideo: "⭕ Rất tiếc, không tìm thấy video nào có dung lượng nhỏ hơn 83MB",
            noAudio: "⭕ Rất tiếc, không tìm thấy audio nào có dung lượng nhỏ hơn 26MB",
            info: "💠 Tiêu đề: %1\n🏪 Channel: %2\n👨‍👩‍👧‍👦 Subscriber: %3\n⏱ Thời gian video: %4\n👀 Lượt xem: %5\n👍 Lượt thích: %6\n🆙 Ngày tải lên: %7\n🔠 ID: %8\n🔗 Link: %9",
            listChapter: "\n📖 Danh sách phân đoạn: %1\n"
        },
        en: {
            error: "❌ An error occurred: %1",
            noResult: "⭕ No search results match the keyword %1",
            choose: "%1Reply to the message with a number to choose or any content to cancel",
            video: "video",
            audio: "audio",
            downloading: "⬇️ Downloading %1 \"%2\"",
            downloading2: "⬇️ Downloading %1 \"%2\"\n🔃 Speed: %3MB/s\n⏸️ Downloaded: %4/%5MB (%6%)\n⏳ Estimated time remaining: %7 seconds",
            noVideo: "⭕ Sorry, no video was found with a size less than 83MB",
            noAudio: "⭕ Sorry, no audio was found with a size less than 26MB",
            info: "💠 Title: %1\n🏪 Channel: %2\n👨‍👩‍👧‍👦 Subscriber: %3\n⏱ Video duration: %4\n👀 View count: %5\n👍 Like count: %6\n🆙 Upload date: %7\n🔠 ID: %8\n🔗 Link: %9",
            listChapter: "\n📖 List chapter: %1\n"
        }
    },

    onStart: async function ({ args, message, event, commandName, getLang }) {
        let type;
        switch (args[0]) {
            case "-v":
            case "video":
                type = "video";
                break;
            case "-a":
            case "-s":
            case "audio":
            case "sing":
                type = "audio";
                break;
            case "-i":
            case "info":
                type = "info";
                break;
            default:
                return message.SyntaxError();
        }

        const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
        const urlYtb = checkurl.test(args[1]);

        if (urlYtb) {
            const infoVideo = await getVideoInfo(args[1]);
            handle({ type, infoVideo, message, downloadFile, getLang });
            return;
        }

        let keyWord = args.slice(1).join(" ");
        keyWord = keyWord.includes("?feature=share") ? keyWord.replace("?feature=share", "") : keyWord;
        const maxResults = 6;

        let result;
        try {
            result = (await search(keyWord)).slice(0, maxResults);
        }
        catch (err) {
            return message.reply(getLang("error", err.message));
        }
        if (result.length == 0)
            return message.reply(getLang("noResult", keyWord));
        let msg = "";
        let i = 1;
        const thumbnails = [];
        const arrayID = [];

        for (const info of result) {
            thumbnails.push(getStreamFromURL(info.thumbnail));
            msg += `${i++}. ${info.title}\nTime: ${info.time}\nChannel: ${info.channel.name}\n\n`;
        }

        message.reply({
            body: getLang("choose", msg),
            attachment: await Promise.all(thumbnails)
        }, (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName,
                messageID: info.messageID,
                author: event.senderID,
                arrayID,
                result,
                type
            });
        });
    },

    onReply: async ({ event, api, Reply, message, getLang }) => {
        const { result, type } = Reply;
        const choice = event.body;

        // Validate choice
        if (!isNaN(choice) && choice >= 1 && choice <= result.length) {
            const infoChoice = result[parseInt(choice) - 1]; // Parse the input and fetch correct video
            const idVideo = infoChoice.id;

            try {
                const infoVideo = await getVideoInfo(idVideo);
                api.unsendMessage(Reply.messageID); // Remove the original choice message
                await handle({ type, infoVideo, message, getLang });
            } catch (error) {
                message.reply(getLang("error", error.message || "Unable to fetch video info"));
            }
        } else {
            // Invalid or out-of-range choice, cancel the operation
            api.unsendMessage(Reply.messageID);
            message.reply(getLang("error", "Invalid selection or operation canceled."));
        }
    }
};

async function handle({ type, infoVideo, message, getLang }) {
    const { title, videoId } = infoVideo;

    if (type == "video") {
        const MAX_SIZE = 83 * 1024 * 1024; // 83MB (max size of video that can be sent on fb)
        const msgSend = message.reply(getLang("downloading", getLang("video"), title));
        const { formats } = await ytdl.getInfo(videoId);
        const getFormat = formats
            .filter(f => f.hasVideo && f.hasAudio && f.quality == 'tiny' && f.audioBitrate == 128)
            .sort((a, b) => b.contentLength - a.contentLength)
            .find(f => f.contentLength || 0 < MAX_SIZE);
        if (!getFormat)
            return message.reply(getLang("noVideo"));
        const getStream = await getStreamAndSize(getFormat.url, `${videoId}.mp4`);
        if (getStream.size > MAX_SIZE)
            return message.reply(getLang("noVideo"));

        const savePath = __dirname + `/tmp/${videoId}_${Date.now()}.mp4`;
        const writeStrean = fs.createWriteStream(savePath);