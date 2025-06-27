const fetch = require('node-fetch');

let handler = async (m, { conn }) => {
  // 1. Beri reaksi 'loading'
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  try {
    const apiUrl = 'https://api.nekorinn.my.id/info/bokepi-latest';
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.status || !data.result || data.result.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('Maaf, gagal mendapatkan data terbaru atau tidak ada update yang ditemukan.');
    }

    const results = data.result;
    const firstCover = results[0].cover;
    let replyText = `🔥 *Update Terbaru Bokepi*\n\n`;
    
    results.forEach((item, index) => {
      replyText += `*${index + 1}.* ${item.title}\n`;
      replyText += `*Link:* ${item.url}\n`;
      replyText += '------------------------------------\n';
    });

    replyText += `\n_Powered by ${data.creator}_`;
    
    // === KODE PENGIRIMAN YANG DISEMPURNAKAN & STABIL ===
    // Menghapus 'contextInfo' dan 'externalAdReply' yang bermasalah
    await conn.sendMessage(m.chat, { 
        image: { url: firstCover },
        caption: replyText 
    }, { quoted: m });

    // 2. Jika berhasil, ubah reaksi menjadi 'sukses'
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    // 3. Jika terjadi error, ubah reaksi menjadi 'gagal'
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    console.error(error);
    m.reply('Terjadi kesalahan saat mengambil data dari API. Coba lagi nanti.');
  }
};

handler.help = ['bokepilatest'];
handler.tags = ['nsfw', 'downloader'];
handler.command = /^(bokepilatest)$/i;
handler.premium = true;
handler.limit = true;

module.exports = handler;