const fs = require("fs");
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

// Credentials
require("dotenv").config();
const token = process.env.BOT_TOKEN;
const luis = process.env.LUIS_URL;

// Response parsing
let raw = fs.readFileSync("./responses.json");
let responses = JSON.parse(raw).reduce(
  (a, x) => ({ ...a, [x.intent]: x.response }),
  {}
);

// Bot setup
const bot = new TelegramBot(token, { polling: true });

// Message listener
bot.on("message", (msg) => {
  console.log("MESSAGE: " + msg.text);
  handleMessage(msg);
});

// Welcome message listener
bot.on("new_chat_members", (msg) => {
  bot.sendMessage(
    msg.chat.id,
    responses["#welcome"][0].text
  );
});

function handleMessage(msg) {
  let { text } = msg;
  let chatId = msg.chat.id;
  // Commands
  switch (text) {
    case "/broke":
    case "/broke@nusmash_bot":
      bot.sendMessage(chatId, responses["/broke"][0].text);
      bot.sendDocument(chatId, responses["/broke"][0].media);
      break;
    default:
      processLanguage(chatId, text);
  }
}

function processLanguage(chatId, text) {
  // Make NLP request
  if (text) {
    axios
      .get(luis + text)
      .then(function (response) {
        let intent = response.data.prediction.topIntent;
        if(intent != "None") {
          let replies = responses[intent];
          let reply = replies[Math.floor(Math.random() * replies.length)].text;
          if (reply) {
            bot.sendMessage(chatId, reply);
          }
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }
}
