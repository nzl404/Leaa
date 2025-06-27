const fetch = require('node-fetch');
const uploadImage = require('../lib/uploadImage.js');

async function handler(m, { conn, usedPrefix, command, text }) {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || q.mediaType || '';

    // 1. Cek apakah pesan adalah "view once"
    if (q.msg?.viewOnce || q.viewOnce) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('Maaf, bot tidak dapat memproses gambar yang bersifat "sekali lihat".\nMohon kirim gambar seperti biasa.');
    }

    // 2. Cek apakah ada gambar yang di-reply
    if (!/^image/.test(mime) || /webp/.test(mime)) {
      await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
      return m.reply(`Kirim/balas gambar lalu sertakan skala resolusi.\n\n*Contoh:*\n${usedPrefix + command} 4\n\n*Pilihan Skala:*\n2 = Rendah\n4 = Sedang\n6 = Tinggi\n8 = Ekstrim`);
    }

    // 3. Cek apakah teks (skala) disertakan
    if (!text) {
      await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
      return m.reply(`Anda belum memasukkan skala resolusi.\n\n*Contoh:*\n${usedPrefix + command} 4`);
    }

    // 4. Cek apakah teks adalah angka
    if (isNaN(text)) {
        await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
        return m.reply(`Skala harus berupa angka.\n\n*Contoh:*\n${usedPrefix + command} 4`);
    }

    // Jika semua validasi lolos, kirim reaksi tunggu dan mulai proses
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

    const img = await q.download();
    const out = await uploadImage(img);
    
    const apiUrl = `https://api.betabotz.eu.org/api/tools/remini-v4?url=${encodeURIComponent(out)}&resolusi=${text}&apikey=${lann}`;
    const api = await fetch(apiUrl);

    if (!api.ok) {
      throw new Error(`API gagal merespons dengan status: ${api.status}`);
    }

    const image = await api.json();

    if (!image.url) {
      throw new Error('Respons dari API tidak mengandung URL gambar.');
    }

    await conn.sendFile(m.chat, image.url, 'remini_result.jpg', `> © Leaa`, m);

    // Kirim reaksi berhasil
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (e) {
    // Kirim reaksi gagal untuk semua jenis error
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    console.error(e);
    m.reply(`Terjadi kesalahan. Mungkin skala yang Anda masukkan terlalu tinggi atau server sedang sibuk.\n\n_Error: ${e.message}_`);
  }
}

handler.help = ['remini2 <skala>'];
handler.tags = ['tools'];
handler.command = ['remini2'];
handler.premium = false;
handler.limit = false;
handler.group = false;

module.exports = handler;