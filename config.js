import dotenv from "dotenv";

dotenv.config();

export default {
  PORT: process.env.PORT || 3000,

  PREFIX: process.env.PREFIX || ".",

  BOT_NAME: process.env.BOT_NAME || "Ahmed Mini Bot",

  OWNER_NAME: process.env.OWNER_NAME || "Ahmed",

  OWNER_NUMBER: process.env.OWNER_NUMBER || "923001234567",

  FOOTER: process.env.FOOTER || "© Ahmed Mini Bot",

  PAIR_MODE: true
};
