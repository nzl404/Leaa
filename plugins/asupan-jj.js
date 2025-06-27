const axios = require('axios').default;

let handler = async (m, { conn }) => {
  try {
    // Loading reaction
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

    // Fetch video list
    const { data: videos } = await axios.get(
      'https://raw.githubusercontent.com/iniseira/asupan/main/jedug.json',
      { 
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }
    );

    if (!Array.isArray(videos) || !videos.length) {
      throw new Error('Data video tidak valid');
    }

    // Get random video
    const videoUrl = videos[Math.floor(Math.random() * videos.length)];

    // Download video
    const { data: videoBuffer } = await axios.get(videoUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      maxContentLength: 50 * 1024 * 1024, // 50MB
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'video/mp4,video/*'
      }
    });

    // Send video
    await conn.sendMessage(m.chat, {
      video: videoBuffer,
      caption: '*_Random Video JJ_*\n\n> Ketik lagi kalo mau yang lainnya',
      mimetype: 'video/mp4'
    }, { quoted: m });

    // Success reaction
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error('Video error:', error.message);

    // Error reaction
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    await conn.reply(m.chat, '*Video tidak tersedia. Silakan coba lagi.*', m);
  }
};

handler.help = ['randomjj'];
handler.tags = ['asupan'];
handler.command = /^(randomjj|jedagjedug)$/i;

module.exports = handler;