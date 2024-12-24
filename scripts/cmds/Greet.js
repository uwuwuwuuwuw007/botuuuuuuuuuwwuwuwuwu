const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "dailyGreetings",
    version: "1.1",
    author: "Aayusha",
    countDown: 5,
    role: 0,
    shortDescription: "Send automated greetings",
    longDescription: "Sends morning, noon, and evening greetings automatically in Nepal time",
    category: "automation",
  },

  onStart: async function ({ api, threadsData }) {
    // Time intervals for morning, noon, and evening in Nepal Time (NPT)
    const schedule = {
      morning: "06:00",
      noon: "12:00",
      evening: "18:00",
    };

    // Message templates for each time
    const messages = {
      morning: "Good Morning! 🌞 Wishing you a wonderful day ahead!",
      noon: "Good Noon! 🌟 Time for a quick refresh and recharge!",
      evening: "Good Evening! 🌙 Relax and enjoy your evening!",
    };

    // Function to send messages to all groups
    const sendGreetings = async (time) => {
      const allGroups = await threadsData.getAll(); // Get all groups
      for (const group of allGroups) {
        if (group.isGroup) {
          api.sendMessage(messages[time], group.threadID);
        }
      }
    };

    // Function to check current time and send greetings
    const checkAndSendGreetings = () => {
      const currentTime = moment().tz("Asia/Kathmandu").format("HH:mm");

      if (currentTime === schedule.morning) {
        sendGreetings("morning");
      } else if (currentTime === schedule.noon) {
        sendGreetings("noon");
      } else if (currentTime === schedule.evening) {
        sendGreetings("evening");
      }
    };

    // Check time every minute
    setInterval(checkAndSendGreetings, 60 * 1000);
  },

  onChat: async function () {
    // No actions needed for individual chats in this module
  },
};