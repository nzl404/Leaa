const fetch = require('node-fetch');
const uploadImage = require('../lib/uploadImage');

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || q.mediaType || '';

    // 1. Tambahan: Cek apakah pesan merupakan pesan sekali lihat (view once)
    if (q.msg?.viewOnce || q.viewOnce) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('Bot tidak dapat memproses gambar/video yang bersifat "sekali lihat". Silakan kirim gambar secara normal.');
    }

    if (/^image/.test(mime) && !/webp/.test(mime)) {
      // 2. Tambahan: Reaksi "tunggu"
      await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

      const img = await q.download();
      const out = await uploadImage(img);
      
      let apiUrl;
      if (command === 'hd') {
        apiUrl = `https://api.betabotz.eu.org/api/tools/remini?url=${out}&apikey=${lann}`;
      } else if (command === 'hd2') {
        apiUrl = `https://api.betabotz.eu.org/api/tools/remini-v2?url=${out}&apikey=${lann}`;
      } else if (command === 'hd3') {
        apiUrl = `https://api.betabotz.eu.org/api/tools/remini-v3?url=${out}&resolusi=4&apikey=${lann}`;
      } else if (command === 'removebg' || command === 'nobg') {
        apiUrl = `https://api.betabotz.eu.org/api/tools/removebg?url=${out}&apikey=${lann}`;
      }

      const api = await fetch(apiUrl);

      // 3. Tambahan: Pengecekan status API
      if (!api.ok) {
        // Jika API error, lempar error untuk ditangkap oleh `catch`
        throw new Error(`API returned ${api.status} ${api.statusText}`);
      }

      const image = await api.json();
      
      if (!image.url) {
        // Jika URL tidak ada dalam respons JSON
        throw new Error('Respons API tidak valid atau tidak mengandung URL gambar.');
      }

      await conn.sendFile(m.chat, image.url, null, wm, m);
      
      // 4. Tambahan: Reaksi "berhasil"
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } else {
      await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
      m.reply(`Kirim gambar dengan caption *${usedPrefix + command}* atau balas (reply) gambar yang sudah dikirim.`);
    }
  } catch (e) {
    // 5. Tambahan: Reaksi "gagal" saat terjadi error
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    console.error(e);
    // Kirim pesan error yang lebih informatif jika memungkinkan
    m.reply(`Terjadi kesalahan. Mungkin server sedang sibuk atau API sedang down. Coba lagi nanti.\n\n_Error: ${e.message}_`);
  }
}

handler.command = handler.help = ['hd', 'hd2', 'hd3', 'removebg', 'nobg'];
handler.tags = ['tools'];
handler.premium = false;
handler.limit = false; // Set ke true jika Anda ingin menggunakan limit

module.exports = handler;