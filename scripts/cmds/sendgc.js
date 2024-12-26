#cmd install sendgc.js const { getStreamsFromAttachment } = global.utils;
const mediaTypes = ["photo", "animated_image", "video", "audio"];

module.exports = {
    config: {
        name: "s3",
        author: "Aayusha Shrestha",
        version: "1.3",
        shortDescription: {
            en: "Send a message to a group chat using its thread ID"
        },
        category: "utility",
        guide: {
            en: "   {pn} <message> <threadID>"
        }
    },

    onStart: async function ({ args, message, event, api }) {
        // Debugging the arguments
        console.log("Received args:", args);

        // Extract message and thread ID
        const threadID = args.pop()?.trim(); // Last argument as thread ID
        const msg = args.join(" ").trim(); // Combine the rest as the message

        console.log("Parsed Message:", msg);
        console.log("Parsed Thread ID:", threadID);

        // Validate inputs
        if (!msg) {
            return message.reply("Please provide a valid message to send.");
        }
        if (!threadID || !/^\d+$/.test(threadID)) {
            return message.reply("Please provide a valid thread ID (group chat UID).");
        }

        // Prepare the message
        const formMessage = {
            body: msg,
            attachment: event.attachments?.length > 0
                ? await getStreamsFromAttachment(
                    event.attachments.filter(item => mediaTypes.includes(item.type))
                )
                : []
        };

        // Attempt to send the message
        try {
            await api.sendMessage(formMessage, threadID);
            return message.reply(`Message sent successfully to group chat ID: ${threadID}`);
        } catch (error) {
            console.error("Error sending message:", error);
            return message.reply(`Failed to send the message to thread ID: ${threadID}.`);
        }
    }
};