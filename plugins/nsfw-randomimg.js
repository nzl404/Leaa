const axios = require('axios').default;
const { promisify } = require('util');
const sleep = promisify(setTimeout);


const CONFIG = {
  fetchTimeout: 15000,      // Waktu timeout saat mengambil daftar URL (ms)
  downloadTimeout: 30000,   // Waktu timeout saat mengunduh media (ms)
  maxContentLength: 100,    // Ukuran file maksimal dalam MB
  maxApiRetries: 3,         // Maksimal coba lagi jika gagal mengambil daftar URL
  maxDownloadRetries: 2,    // Maksimal coba lagi jika gagal mengunduh media
  retryDelay: 2000,         // Waktu jeda dasar sebelum mencoba lagi (ms)
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0'
};


const commandConfig = [
  {
    aliases: ['paptt', 'paptetek', 'paptete', 'papsusu', 'papdada'],
    mediaUrl: 'https://raw.githubusercontent.com/iniseira/nsfw/main/susu.json',
    caption: 'Random pap susu🥵💦. Jgn buat ngocok yh😖.'
  },
  {
    aliases: ['papmmk', 'papmemek'],
    mediaUrl: 'https://raw.githubusercontent.com/iniseira/nsfw/main/mmk.json',
    caption: 'Random pap memew🥵💦. Jgn Buat ngocok yh😖.'
  },
  {
    aliases: ['naked', 'bugil', 'telanjang'],
    mediaUrl: 'https://raw.githubusercontent.com/iniseira/nsfw/main/naked.json',
    caption: 'Random Naked Girl💦. Jgn buat ngocok yh😖'
  },
  {
    aliases: ['lesbi', 'lesb', 'lesbian'],
    mediaUrl: 'https://raw.githubusercontent.com/iniseira/nsfw/main/lesbi.json',
    caption: 'Random Lesbi💦. Jgn buat ngocok yh😖.'
  },
  {
    aliases: ['cosplay18', 'cos18'],
    mediaUrl: 'https://raw.githubusercontent.com/iniseira/nsfw/main/cosplay.json',
    caption: 'Random Cosplay 18+. Jgn buat ngocok yh😖'
  }
];


async function sendReaction(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
  } catch (error) {
    console.error('Gagal mengirim reaksi:', error.message);
  }
}


function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}


async function getMediaUrlWithRetry(jsonUrl) {
  for (let attempt = 1; attempt <= CONFIG.maxApiRetries; attempt++) {
    try {
      const { data: mediaLinks } = await axios.get(jsonUrl, {
        timeout: CONFIG.fetchTimeout,
        headers: { 'User-Agent': CONFIG.userAgent }
      });
      if (!Array.isArray(mediaLinks) || mediaLinks.length === 0) {
        throw new Error('Data media dari API tidak valid atau kosong.');
      }
      return pickRandom(mediaLinks);
    } catch (error) {
      if (attempt === CONFIG.maxApiRetries) throw error;
      await sleep(CONFIG.retryDelay * attempt);
    }
  }
}


async function downloadMediaWithRetry(url) {
  for (let attempt = 1; attempt <= CONFIG.maxDownloadRetries; attempt++) {
    try {
      const { data } = await axios.get(url, {
        timeout: CONFIG.downloadTimeout,
        responseType: 'arraybuffer',
        maxContentLength: CONFIG.maxContentLength * 1024 * 1024,
        headers: { 'User-Agent': CONFIG.userAgent }
      });
      return data;
    } catch (error) {
      if (attempt === CONFIG.maxDownloadRetries) throw error;
      await sleep(CONFIG.retryDelay * attempt);
    }
  }
}


const handler = async (m, { conn, command }) => {
  const config = commandConfig.find(cmd => cmd.aliases.includes(command.toLowerCase()));
  if (!config) return; 

  let mediaBuffer = null;
  try {
    await sendReaction(conn, m, '🕒');

    const mediaUrl = await getMediaUrlWithRetry(config.mediaUrl);
    if (!mediaUrl) throw new Error("Gagal mendapatkan URL media.");

    mediaBuffer = await downloadMediaWithRetry(mediaUrl);
    if (!mediaBuffer) throw new Error("Gagal mengunduh media.");
    
    const messageOptions = {
      caption: config.caption,
      viewOnce: true,
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: 'V I E W  O N C E',
          body: 'Media ini hanya bisa dilihat sekali.',
          mediaType: 1, // Default untuk gambar
          showAdAttribution: false,
          renderLargerThumbnail: true
        }
      }
    };
    
    if (mediaUrl.endsWith('.mp4')) {
      messageOptions.video = mediaBuffer;
      messageOptions.mimetype = 'video/mp4';
      messageOptions.contextInfo.externalAdReply.mediaType = 2;
    } else {
      messageOptions.image = mediaBuffer;
      messageOptions.mimetype = 'image/jpeg';
    }

    await conn.sendMessage(m.chat, messageOptions, { quoted: m });
    await sendReaction(conn, m, '✅');

  } catch (error) {
    console.error(`[${command.toUpperCase()} ERROR]`, { message: error.message, code: error.code });
    await sendReaction(conn, m, '❌');
    const userError = (error.message.includes("404")) ? `*Media tidak ditemukan (404)*` : `*Gagal memuat media, coba lagi nanti.*`;
    await m.reply(userError);
  } finally {
    mediaBuffer = null; 
  }
};


handler.help = commandConfig.map(cmd => cmd.aliases[0]);
handler.tags = ['nsfw'];

const allAliases = commandConfig.flatMap(cmd => cmd.aliases);
handler.command = new RegExp(`^(${allAliases.join('|')})$`, 'i');

handler.premium = true;
handler.group = false;

module.exports = handler;