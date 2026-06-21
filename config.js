const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

module.exports = {
  // ========== WHATSAPP CONFIG ==========
  OWNER_NUMBER: process.env.OWNER_NUMBER || "923001234567",
  // Add your WhatsApp number here
  
  // ========== BOT CONFIG ==========
  PREFIX: process.env.PREFIX || ".",
  BOT_NAME: process.env.BOT_NAME || "Ahmed-Mini",
  BOT_FOOTER: "© Ahmed-Mini-Bot 2026",
  
  // ========== MODE ==========
  MODE: process.env.MODE || "public",
  // public = works everywhere
  // private = owner only
  // group = groups only
  
  // ========== FEATURES ==========
  AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true",
  AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
  ANTI_DELETE: process.env.ANTI_DELETE || "false",
  
  // ========== SERVER ==========
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development"
};
