const { OpenAI } = require("openai");
require("dotenv").config();

const isChatGPT = process.env.isChatGPT === "true";

const openai = new OpenAI({
  baseURL: isChatGPT ? undefined : "https://api.deepseek.com",
  apiKey: isChatGPT ? process.env.OPENAI_API_KEY : process.env.DEEPSEEK_API_KEY,
  organization: isChatGPT ? process.env.OPENAI_ORG : process.env.DEEPSEEK_ORG,
});

module.exports = openai;
