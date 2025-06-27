const fetch = require('node-fetch');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `Harap masukkan URL dari Bokepi yang ingin Anda lihat detailnya.\n\n*Contoh:*\n${usedPrefix + command} https://164.68.106.43/bokep-indo-skandal-ngewe-sadhivika-vokalis-bornean/`;
  
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  try {
    const apiUrl = `https://api.nekorinn.my.id/info/bokepi-detail?url=${encodeURIComponent(args[0])}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.status || !data.result) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply(data.message || 'Gagal mengambil detail dari API.');
    }

    const { title, uploader, description, duration, uploadDate, downloadUrl, embedUrl } = data.result;

    const fullDownloadUrl = 'https:' + downloadUrl;

    let replyText = `
🎬 *Judul:* ${title}
👤 *Uploader:* ${uploader}
⏰ *Durasi:* ${duration}
📅 *Tanggal Upload:* ${uploadDate}

📝 *Deskripsi:*
${description}

🔗 *Link Download:*
${fullDownloadUrl}
    `.trim();

    // Langsung kirim hasil tanpa react 'sukses'
    await m.reply(replyText);

  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    console.error('Bokepi-Detail Plugin Error:', error);
    m.reply('Terjadi kesalahan saat memproses permintaan Anda.');
  }
};

handler.help = ['bokepidetail <url>'];
handler.tags = ['downloader'];
handler.command = /^(bokepidetail)$/i;
handler.premium = true;

module.exports = handler;