const axios = require('axios').default;
const { promisify } = require('util');
const sleep = promisify(setTimeout);

const commandConfig = [
  {
    aliases: ['bkpcina', 'bokepcina', 'bkpcyna', 'bokepcyna'],
    jsonUrl: 'https://raw.githubusercontent.com/iniseira/nsfw/main/bkpcina.json',
    caption: '*_Random bokep Cyna🥵. Jgn buat ngocok yaa!😖_*'
  },
  {
    aliases: ['bkplokal', 'bokeplokal', 'bkpindo', 'bokepindo'],
    jsonUrl: 'https://raw.githubusercontent.com/iniseira/nsfw/main/bkplokal.json',
    caption: '*_Random bokep Indo🥵💦_*'
  },
  {
    aliases: ['douyin18', 'tiktok18'],
    jsonUrl: 'https://raw.githubusercontent.com/iniseira/nsfw/main/douyin18.json',
    caption: '*_Random Douyin 18+. Jangan buat ngocok yaa!😖_*'
  },
  {
    aliases: ['seponk', 'sepong'],
    jsonUrl: 'https://raw.githubusercontent.com/iniseira/nsfw/main/bkpsepong.json',
    caption: '*_Random video nyeponk🥵. Jgn buat ngocok yaa!😖_*'
  },
  {
    aliases: ['colmew', 'colmek', 'clmk', 'omek', 'omew'],
    jsonUrl: 'https://raw.githubusercontent.com/iniseira/nsfw/main/omek.json',
    caption: '*_Random video colmek. Jgn buat ngocok yaa!😖_*'
  }
];

let handler = async (m, { conn, command }) => {

  const config = commandConfig.find(cmd => cmd.aliases.includes(command.toLowerCase()));

  if (!config) {
    console.error(`Konfigurasi untuk command '${command}' tidak ditemukan.`);
    return;
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

    const { data: videos } = await axios.get(config.jsonUrl, {
      timeout: 7000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!Array.isArray(videos) || !videos.length) {
      throw new Error('Data video tidak valid atau kosong dari API.');
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const videoUrl = videos[Math.floor(Math.random() * videos.length)];

        if (!videoUrl) {
          throw new Error('URL video yang didapat kosong.');
        }

        const { data: videoBuffer } = await axios.get(videoUrl, {
          responseType: 'arraybuffer',
          timeout: 20000,
          maxContentLength: 25 * 1024 * 1024,
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'video/mp4,video/*'
          }
        });

        await conn.sendMessage(m.chat, {
          video: videoBuffer,
          caption: config.caption,
          mimetype: 'video/mp4'
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        return;

      } catch (downloadError) {
        console.error(`Percobaan unduhan ke-${attempt + 1} untuk command '${command}' gagal:`, downloadError.message);
        if (attempt < 2) await sleep(1500);
      }
    }

    throw new Error('Gagal mengunduh video setelah beberapa kali percobaan.');

  } catch (error) {
    console.error(`[VIDEO ERROR - ${command.toUpperCase()}]`, {
      message: error.message,
      code: error.code || 'UNKNOWN'
    });
    
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    await conn.reply(m.chat, `*Gagal memproses permintaan.*\n_Error: ${error.message}_`, m);
  }
};

handler.help = commandConfig.map(cmd => cmd.aliases[0]);
handler.tags = ['nsfw'];

const allAliases = commandConfig.flatMap(cmd => cmd.aliases);
handler.command = new RegExp(`^(${allAliases.join('|')})$`, 'i');

handler.premium = true;
handler.group = false;

module.exports = handler;