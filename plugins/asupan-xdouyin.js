const axios = require('axios').default;

let handler = async (m, { conn }) => {
  try {
    // Show loading reaction
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

    // Fetch media list
    const { data: mediaList } = await axios.get(
      'https://raw.githubusercontent.com/iniseira/asupan/main/douyin.json',
      { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    if (!Array.isArray(mediaList) || !mediaList.length) {
      throw new Error('Data media tidak valid');
    }

    // Filter MP4 videos only
    const videoList = mediaList.filter(url => url.toLowerCase().endsWith('.mp4'));

    if (!videoList.length) {
      throw new Error('Tidak ada video MP4 tersedia');
    }

    // Get random video
    const mediaUrl = videoList[Math.floor(Math.random() * videoList.length)];

    // Download video
    const { data: mediaBuffer } = await axios.get(mediaUrl, {
      responseType: 'arraybuffer',
      timeout: 60000,
      maxContentLength: 100 * 1024 * 1024,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'video/mp4,video/*'
      }
    });

    // Send video
    await conn.sendMessage(m.chat, {
      video: mediaBuffer,
      caption: `*_Random Asupan Cewek Douyin_*\n\n🔗 *Sumber URL:* ${mediaUrl}\n\n> © Marshaaa`,
    }, { quoted: m });

    // Show success reaction
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error('[MEDIA ERROR]', error.message);

    // Show error reaction
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

    // Send error message
    let errorMsg = '*Video tidak tersedia. Silakan coba lagi.*';
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      errorMsg = '*Koneksi terputus atau video terlalu besar. Silakan coba lagi.*';
    }
    
    await conn.reply(m.chat, errorMsg, m);
  }
};

handler.help = ['asupandouyin'];
handler.tags = ['asupan'];
handler.command = /^(asupandouyin)$/i;

module.exports = handler;