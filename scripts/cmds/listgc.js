module.exports = {
    config: {
        name: "ls",
        author: "Aayusha Shrestha",
        version: "1.0",
        shortDescription: {
            en: "Show the list of group chats the bot is part of"
        },
        category: "utility",
        guide: {
            en: "{pn}\nThis command displays all the groups the bot is part of, along with their names and thread IDs."
        }
    },

    onStart: async function ({ message, api }) {
        try {
            // Get the list of threads the bot is part of
            const threads = await api.getThreadList(50, null, ["inbox"]);
            const groupThreads = threads.filter(thread => thread.isGroup);

            // If there are no groups
            if (groupThreads.length === 0) {
                return message.reply("No groups found.");
            }

            // Format the group list
            const groupList = groupThreads.map((group, index) => {
                return `${index + 1}. ${group.name || "Unnamed Group"}\n   UID: ${group.threadID}`;
            }).join("\n\n");

            // Send the list as a reply
            return message.reply(`Here are the groups the bot is part of:\n\n${groupList}`);
        } catch (error) {
            console.error("Error fetching group list:", error);
            return message.reply("Failed to retrieve the list of groups. Please try again later.");
        }
    }
};