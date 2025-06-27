const axios = require('axios').default;

// Storage untuk tracking media yang sudah dikirim
let sentMedia = new Set();
let sendCount = 0;
const RESET_LIMIT = 500;

let handler = async (m, { conn }) => {
  try {
    // Show loading reaction
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

    // Fetch media list
    const { data: mediaList } = await axios.get(
      'https://raw.githubusercontent.com/iniseira/asupan/main/tobrut.json',
      { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    if (!Array.isArray(mediaList) || !mediaList.length) {
      throw new Error('Data media tidak valid');
    }

    // Reset tracking jika sudah mencapai limit
    if (sendCount >= RESET_LIMIT) {
      sentMedia.clear();
      sendCount = 0;
    }

    // Cari media yang belum pernah dikirim
    let availableMedia = mediaList.filter(url => !sentMedia.has(url));
    
    // Jika semua media sudah dikirim, reset dan gunakan semua media
    if (availableMedia.length === 0) {
      sentMedia.clear();
      sendCount = 0;
      availableMedia = mediaList;
    }

    // Get random media dari yang tersedia
    const mediaUrl = availableMedia[Math.floor(Math.random() * availableMedia.length)];
    
    // Tambahkan ke daftar media yang sudah dikirim
    sentMedia.add(mediaUrl);
    sendCount++;

    // Determine media type
    const fileExtension = mediaUrl.split('.').pop().toLowerCase();
    const isVideo = fileExtension === 'mp4';

    // Download media
    const { data: mediaBuffer } = await axios.get(mediaUrl, {
      responseType: 'arraybuffer',
      timeout: isVideo ? 60000 : 30000,
      maxContentLength: 100 * 1024 * 1024,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': isVideo ? 'video/mp4,video/*' : 'image/jpeg,image/*'
      }
    });

    // Send media with appropriate type
    await conn.sendMessage(m.chat, {
      [isVideo ? 'video' : 'image']: mediaBuffer,
      caption: `*_Nih brut_*\n\n🔗 *Sumber URL:* ${mediaUrl}\n\n> © Marshaaa`,
    }, { quoted: m });

    // Show success reaction
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error('[MEDIA ERROR]', error.message);

    // Show error reaction
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

    // Send error message
    let errorMsg = '*Media tidak tersedia. Silakan coba lagi.*';
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      errorMsg = '*Koneksi terputus atau media terlalu besar. Silakan coba lagi.*';
    } else if (error.message.includes('Data media tidak valid')) {
      errorMsg = '*Gagal mengambil daftar media. Silakan coba lagi.*';
    }
    
    await conn.reply(m.chat, errorMsg, m);
  }
};

// Fungsi untuk reset manual (opsional)
handler.reset = () => {
  sentMedia.clear();
  sendCount = 0;
};

// Fungsi untuk cek status (opsional)
handler.status = () => {
  return {
    sentCount: sendCount,
    totalSent: sentMedia.size,
    resetLimit: RESET_LIMIT,
    remaining: RESET_LIMIT - sendCount
  };
};

handler.help = ['tobrut'];
handler.tags = ['asupan'];
handler.command = /^(tobrut|tbrt|brut)$/i;

module.exports = handler;