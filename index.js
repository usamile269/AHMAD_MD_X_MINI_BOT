const { Boom } = require('@hapi/boom');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, isJidBroadcast } = require('@whiskeysockets/baileys');
const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const config = require('./config');

const app = express();
const PREFIX = config.PREFIX;
let sock;
let qrData = '';

// ============ BAILEYS CONNECTION ============
async function connectBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: require('pino')({ level: 'silent' })
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      qrcode.generate(qr, { small: true });
      qrData = qr;
      console.log(chalk.yellow('\n📱 Scan QR code above to connect\n'));
    }
    
    if (connection === 'connecting') {
      console.log(chalk.blue('⏳ Connecting to WhatsApp...'));
    }
    if (connection === 'open') {
      console.log(chalk.green('\n✅ Bot Connected Successfully!\n'));
    }
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(chalk.red('❌ Connection closed'));
      if (shouldReconnect) {
        setTimeout(connectBot, 3000);
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // ============ MESSAGE HANDLER ============
  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;
    
    const messageType = Object.keys(msg.message)[0];
    const isCmd = msg.message.conversation?.startsWith(PREFIX) || 
                  msg.message.extendedTextMessage?.text?.startsWith(PREFIX);
    
    if (!isCmd) return;

    const from = msg.key.remoteJid;
    const sender = msg.key.participant;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const command = text.slice(PREFIX.length).trim().split(' ')[0].toLowerCase();
    const args = text.slice(PREFIX.length).trim().split(' ').slice(1);

    console.log(chalk.cyan(`\n📨 Command: ${command}`));
    console.log(chalk.cyan(`👤 From: ${sender}\n`));

    try {
      // ============ MENU COMMAND ============
      if (command === 'menu') {
        const menuText = `╔════════════════════════════╗
║  🤖 *Ahmed-Mini-Bot* 🤖   ║
╚════════════════════════════╝

📋 *Available Commands:*

*.ping* - Bot is alive?
*.alive* - Show bot info
*.menu* - This menu

🔧 *Coming Soon:* More commands!

© Ahmed-Mini-Bot 2026`;

        await sock.sendMessage(from, { text: menuText }, { quoted: msg });
      }

      // ============ PING COMMAND ============
      else if (command === 'ping') {
        const ping = Date.now();
        const pong = await sock.sendMessage(from, { text: '🏓 *PONG!*' }, { quoted: msg });
        const time = Date.now() - ping;
        await sock.sendMessage(from, { text: `⏱️ Response Time: ${time}ms` }, { quoted: pong });
      }

      // ============ ALIVE COMMAND ============
      else if (command === 'alive') {
        const aliveText = `╔════════════════════════════╗
║   ✅ *BOT IS ALIVE* ✅    ║
╚════════════════════════════╝

🤖 *Bot Name:* ${config.BOT_NAME}
👤 *Owner:* Ahmed-MD
⚙️ *Prefix:* ${PREFIX}
📱 *Platform:* WhatsApp
✨ *Status:* Online & Ready

*Commands:*
.ping - Check response time
.alive - This message
.menu - Show all commands

${config.BOT_FOOTER}`;

        await sock.sendMessage(from, { text: aliveText }, { quoted: msg });
      }

      // ============ INVALID COMMAND ============
      else {
        await sock.sendMessage(from, { 
          text: `❌ Unknown command: *${command}*\n\nUse *.menu* to see available commands` 
        }, { quoted: msg });
      }

    } catch (error) {
      console.error(chalk.red('Error:', error.message));
      await sock.sendMessage(from, { 
        text: `⚠️ Error: ${error.message}` 
      }, { quoted: msg }).catch(() => {});
    }
  });
}

// ============ EXPRESS SERVER ============
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    bot: 'Ahmed-Mini-Bot',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

app.get('/pair', (req, res) => {
  res.sendFile(__dirname + '/pair.html');
});

app.get('/qr', (req, res) => {
  if (!qrData) {
    return res.json({ error: 'QR not generated yet' });
  }
  res.json({ qr: qrData });
});

app.listen(config.PORT, () => {
  console.log(chalk.green(`\n🚀 Server running on port ${config.PORT}`));
  console.log(chalk.green(`🌐 Visit: http://localhost:${config.PORT}/pair\n`));
});

// ============ START BOT ============
connectBot().catch(err => console.log(chalk.red('Connection Error:', err)));
