const axios = require('axios').default;

// Storage untuk tracking video yang sudah dikirim
let sentVideos = new Set();
let sendCount = 0;
const RESET_LIMIT = 200;

let handler = async (m, { conn }) => {
  try {
    // Show loading reaction
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

    // Fetch media list
    const { data: mediaList } = await axios.get(
      'https://raw.githubusercontent.com/iniseira/asupan/main/asupan2.json',
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

    // Reset tracking jika sudah mencapai limit
    if (sendCount >= RESET_LIMIT) {
      sentVideos.clear();
      sendCount = 0;
    }

    // Cari video yang belum pernah dikirim
    let availableVideos = videoList.filter(url => !sentVideos.has(url));
    
    // Jika semua video sudah dikirim, reset dan gunakan semua video
    if (availableVideos.length === 0) {
      sentVideos.clear();
      sendCount = 0;
      availableVideos = videoList;
    }

    // Get random video dari yang tersedia
    const mediaUrl = availableVideos[Math.floor(Math.random() * availableVideos.length)];
    
    // Tambahkan ke daftar video yang sudah dikirim
    sentVideos.add(mediaUrl);
    sendCount++;

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
      caption: `*_Random Asupan Luar_*\n\n🔗 *Sumber URL:* ${mediaUrl}\n\n> © Marshaaa`,
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
    } else if (error.message.includes('Data media tidak valid')) {
      errorMsg = '*Gagal mengambil daftar video. Silakan coba lagi.*';
    }
    
    await conn.reply(m.chat, errorMsg, m);
  }
};

// Fungsi untuk reset manual (opsional)
handler.reset = () => {
  sentVideos.clear();
  sendCount = 0;
};

// Fungsi untuk cek status (opsional)
handler.status = () => {
  return {
    sentCount: sendCount,
    totalSent: sentVideos.size,
    resetLimit: RESET_LIMIT,
    remaining: RESET_LIMIT - sendCount
  };
};

handler.help = ['asupan2 `[𝚕𝚞𝚊𝚛]`'];
handler.tags = ['asupan'];
handler.command = /^(asupan2)$/i;

module.exports = handler;