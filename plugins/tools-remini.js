const fetch = require('node-fetch');
const uploadImage = require('../lib/uploadImage.js');

async function handler(m, { conn, usedPrefix, command }) {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || q.mediaType || '';

    if (q.msg?.viewOnce || q.viewOnce) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('Maaf, bot tidak dapat memproses gambar yang bersifat "sekali lihat".\nMohon kirim gambar seperti biasa.');
    }

    if (/^image/.test(mime) && !/webp/.test(mime)) {
      await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
      
      const img = await q.download();
      const out = await uploadImage(img);
      
      const apiEndpoints = [
        `https://api.betabotz.eu.org/api/tools/remini?url=${encodeURIComponent(out)}&apikey=${lann}`,
        `https://api.betabotz.eu.org/api/tools/remini-v2?url=${encodeURIComponent(out)}&apikey=${lann}`,
        `https://api.betabotz.eu.org/api/tools/remini-v3?url=${encodeURIComponent(out)}&resolusi=2&apikey=${lann}`,
        `https://api.betabotz.eu.org/api/tools/remini-v4?url=${encodeURIComponent(out)}&resolusi=2&apikey=${lann}`
      ];

      let success = false;

      for (let i = 0; i < apiEndpoints.length; i++) {
        const apiUrl = apiEndpoints[i];
        try {
          if (i > 0) {
            await m.reply(`Mencoba API ke-${i + 1}...`);
          }
          
          const apiResponse = await fetch(apiUrl, { timeout: 75000 });

          if (apiResponse.ok) {
            const image = await apiResponse.json();
            if (!image || !image.url) {
              console.error(`API ke-${i + 1} memberikan respons tidak valid.`);
              continue; 
            }
            
            await conn.sendFile(m.chat, image.url, 'remini.jpg', `> © Leaa`, m);
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            
            success = true;
            break;
          }
        } catch (e) {
          console.error(`Error saat mencoba API ke-${i + 1}:`, e.message);
        }
      }

      if (!success) {
        throw new Error('Semua API yang tersedia gagal memproses gambar Anda.');
      }

    } else {
      await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
      m.reply(`Format salah. Kirim gambar dengan caption *${usedPrefix + command}* atau balas gambar yang ada.`);
    }
  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    console.error('Remini Handler Error:', e.message);
    
    let errorMessage = 'Gagal memproses gambar. Semua server sedang sibuk atau tidak dapat memproses gambar ini. Silakan coba lagi nanti.';
    m.reply(errorMessage);
  }
}

handler.help = ['remini'];
handler.tags = ['tools'];
handler.command = ['remini'];
handler.premium = false;
handler.limit = false;

module.exports = handler;