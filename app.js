const fs = require("fs");
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

// Credentials
require("dotenv").config();
const token = process.env.BOT_TOKEN;
const luis = process.env.LUIS_URL;

// Response setup
let rawdata = fs.readFileSync("./responses.json");
let responses = {};
let arr = JSON.parse(rawdata);
for (let i = 0; i < arr.length; i++) {
  responses[arr[i].intent] = arr[i].response;
}

// Bot setup
const bot = new TelegramBot(token, { polling: true });

// Message listener
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  console.log("MESSAGE: " + msg.text);
  processMessage(msg.text);
});

// Welcome message listener
bot.on("new_chat_members", (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Welcome! If you'd like, you can share your school, year, major, (and main) so we can get to know you better :)"
  );
});

function processMessage(text) {
  // check for commands
  switch (text) {
    case "/broke":
    case "/broke@nusmash_bot":
      bot.sendMessage(chatId, "look how broke this bad boy is");
      bot.sendDocument(
        chatId,
        "https://ultimateframedata.com/hitboxes/mr_game_and_watch/MrGame_WatchDSmash.gif"
      );
      break;
    default:
      if (text) languageProcessing(text);
  }
}

function languageProcessing(text) {
  axios
    .get(luis + text)
    .then(function (response) {
      let reply = responses[response.data.prediction.topIntent];
      if (reply) {
        bot.sendMessage(chatId, reply);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}
