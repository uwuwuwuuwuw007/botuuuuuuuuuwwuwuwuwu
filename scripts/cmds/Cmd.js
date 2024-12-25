module.exports = {
  config: {
    name: "HARRYCMD",
    version: "1.0",
    author: "Aayusha",
    countDown: 5,
    role: 0,
    shortDescription: "no prefix",
    longDescription: "no prefix",
    category: "no prefix",
  },

  onStart: async function () {},

  onChat: async function ({ event, message, api, usersData }) {
    if (!event.body) return;

    const userMessage = event.body.toLowerCase();
    const id = event.senderID;

    try {
      const userData = await usersData.get(id);
      const name = userData.name;
      const ment = [{ id: id, tag: name }];

      if (userMessage.includes("command")) {
        api.setMessageReaction("♥️", event.messageID, () => {}, true);
        return message.reply({
          body: `Hi, ${name}! Thank you for using HARRYv6 here's Your Command!!
pkg install python
pkg install git
rm -rf HARRYv6
git clone --depth=1 https://github.com/HARRY-EXE/HARRYv6
cd HARRYv6
pip install -r requirements.txt
python3 run.py`,
          mentions: ment,
        });
      }

      if (userMessage.includes("setup")) {
        api.setMessageReaction("♥️", event.messageID, () => {}, true);
        return message.reply({
          body: `Hello, ${name}! Thank you for using HARRYv6 Here's Your Setup!!
termux-setup-storage
pkg update
pkg upgrade
pkg install python
pkg install python2
pip install requests
pip install mechanize
pip install bs4
pip install rich
pkg install git`,
          mentions: ment,
        });
      }

      if (userMessage.includes("cmd")) {
        api.setMessageReaction("♥️",event.messageID, () => {}, true);
        return message.reply({
          body: `Hi, ${name}! Thank you for using HARRYv6 here's Your Command!!
pkg install python
pkg install git
rm -rf HARRYv6
git clone --depth=1 https://github.com/HARRY-EXE/HARRYv6
cd HARRYv6
pip install -r requirements.txt
python3 run.py`,
          mentions: ment,
        });
      }
    } catch (error) {
      console.error("Error setting reaction or sending reply:", error);
    }
  },
};